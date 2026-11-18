extends Control

const Data = preload("res://scripts/data.gd")
const UiStyle = preload("res://scripts/ui_style.gd")
## Raíz de la app (equivalente a index.html + src/ui/*): login, menú, partidas+modal, resultados,
## overlays de pausa/sonido, HUD con controles táctiles y cambio de tema (A/B/C). La partida vive en match.gd.

var theme_id := "a"
var screens: Dictionary = {}
var current := ""
var selected_world: Dictionary
var last_match := {}
var modal_screen: Dictionary = {}
var paused := false
var cur_match: Node2D = null

var all_buttons: Array = []
var all_panels: Array = []
var all_labels: Array = []

# refs de pantallas
var login_error: Label
var menu_user: Label
var theme_btn: Button
var worlds_row: HBoxContainer
var screens_row: VBoxContainer
var screens_title: Label
var modal_overlay: Control
var modal_title: Label
var modal_info: Label
var modal_recipes: Label
var modal_controls: Label
var results_screen_lbl: Label
var results_score: Label
var results_medal: Label
var results_cans: HBoxContainer

# refs HUD
var hud_layer: CanvasLayer
var hud_level: Label
var hud_score: Label
var hud_cans: Label
var hud_held: Label
var hud_time: Label
var hud_timebar_fill: ColorRect
var hud_orders: VBoxContainer
var order_cards: Array = []
var hud_hint: Label
var hud_progress: ProgressBar
var hud_progress_label: Label
var hud_theme_btn: Button
var touch_controls: Control
var joy_base: Panel
var joy_stick: Panel
var joy_stick_home := Vector2.ZERO
var joy_pointer := -1
var joy_center := Vector2.ZERO
var pause_overlay: Control
var sound_overlay: Control

var touch := {"vec": Vector2.ZERO, "e_down": false, "e_just": false, "q_just": false}

func _ready() -> void:
	randomize()
	selected_world = Data.worlds()[0]
	if FileAccess.file_exists("user://theme.txt"):
		var t := FileAccess.get_file_as_string("user://theme.txt").strip_edges()
		if UiStyle.THEMES.has(t):
			theme_id = t
	_build_all()
	# smoke test headless: godot --headless --path . --quit-after 1200 -- --auto-match [--verbose-match]
	if OS.get_cmdline_user_args().has("--auto-match"):
		if Store.user == "":
			Store.login("smoke")
		start_match("torre", "torre-s2")
		return
	if Store.user != "":
		open_menu()
	else:
		show_screen("login")

# ---------------------------------------------------------------- helpers UI

func mk_button(text: String, variant := "normal") -> Button:
	var b := Button.new()
	b.text = text
	b.set_meta("variant", variant)
	all_buttons.append(b)
	UiStyle.style_button(b, theme_id, variant)
	return b

func mk_label(text: String, size := 16, on_panel := false) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.set_meta("fs", size)
	l.set_meta("on_panel", on_panel)
	all_labels.append(l)
	UiStyle.style_label(l, theme_id, on_panel)
	return l

func mk_panel(on_screen := true) -> PanelContainer:
	var p := PanelContainer.new()
	all_panels.append(p)
	UiStyle.style_panel(p, theme_id)
	return p

func mk_screen(id: String) -> VBoxContainer:
	var s := VBoxContainer.new()
	s.name = id
	s.set_anchors_preset(Control.PRESET_FULL_RECT)
	s.alignment = BoxContainer.ALIGNMENT_CENTER
	s.add_theme_constant_override("separation", 14)
	s.visible = false
	add_child(s)
	screens[id] = s
	return s

func show_screen(id: String) -> void:
	current = id
	for k in screens:
		screens[k].visible = (k == id)

func apply_theme() -> void:
	for b in all_buttons:
		UiStyle.style_button(b, theme_id, b.get_meta("variant", "normal"))
	for p in all_panels:
		UiStyle.style_panel(p, theme_id)
	for l in all_labels:
		UiStyle.style_label(l, theme_id, l.get_meta("on_panel", false))
		var fs = int(l.get_meta("fs", 16))
		l.add_theme_font_size_override("font_size", fs)
	theme_btn.text = "🎨 %s" % UiStyle.THEMES[theme_id]["name"]
	hud_theme_btn.tooltip_text = "Tema: %s — clic para cambiar" % UiStyle.THEMES[theme_id]["name"]
	var f := FileAccess.open("user://theme.txt", FileAccess.WRITE)
	if f:
		f.store_string(theme_id)
		f.close()

func toggle_theme() -> void:
	theme_id = UiStyle.next_theme(theme_id)
	apply_theme()

func toggle_fullscreen() -> void:
	var w := get_tree().root
	w.mode = Window.MODE_FULLSCREEN if w.mode != Window.MODE_FULLSCREEN else Window.MODE_WINDOWED

# ---------------------------------------------------------------- build UI

func _build_all() -> void:
	_build_login()
	_build_menu()
	_build_partidas()
	_build_results()
	_build_overlays()
	_build_hud()

func _build_login() -> void:
	var s := mk_screen("login")
	var title := mk_label("🐱‍⚗️ Alchemistic Kittens", 30)
	title.add_theme_color_override("font_color", UiStyle.THEMES[theme_id]["gold"])
	s.add_child(title)
	s.add_child(mk_label("Inicia sesión para entrar a la torre", 15))
	var form := mk_panel()
	var fv := VBoxContainer.new()
	fv.add_theme_constant_override("separation", 10)
	fv.custom_minimum_size = Vector2(280, 0)
	var user_e := LineEdit.new()
	user_e.placeholder_text = "Usuario"
	var pass_e := LineEdit.new()
	pass_e.placeholder_text = "Contraseña"
	pass_e.secret = true
	login_error = mk_label("", 13)
	var enter := mk_button("▶ Entrar")
	enter.pressed.connect(func() -> void: _on_login(user_e.text.strip_edges(), pass_e.text))
	var guest := mk_button("¿Solo quieres probar? → Invitado", "secondary")
	guest.pressed.connect(func() -> void: _on_login("invitado", "demo"))
	fv.add_child(user_e)
	fv.add_child(pass_e)
	fv.add_child(login_error)
	fv.add_child(enter)
	fv.add_child(guest)
	form.add_child(fv)
	s.add_child(form)

func _on_login(u: String, p: String) -> void:
	if u == "" or p == "":
		login_error.text = "Escribe usuario y contraseña (demo local: cualquier valor sirve)"
		return
	Store.login(u)
	open_menu()

func _build_menu() -> void:
	var s := mk_screen("menu")
	var title := mk_label("🗼🐱 Alchemistic Kittens", 30)
	title.add_theme_color_override("font_color", UiStyle.THEMES[theme_id]["gold"])
	s.add_child(title)
	menu_user = mk_label("", 15)
	s.add_child(menu_user)
	var play := mk_button("▶ Jugar")
	play.pressed.connect(func() -> void: render_partidas(); show_screen("partidas"))
	var snd := mk_button("🔊 Sonido", "secondary")
	snd.pressed.connect(func() -> void: sound_overlay.visible = true)
	theme_btn = mk_button("🎨 %s" % UiStyle.THEMES[theme_id]["name"], "secondary")
	theme_btn.pressed.connect(toggle_theme)
	var fs := mk_button("⛶ Pantalla completa", "secondary")
	fs.pressed.connect(toggle_fullscreen)
	var out := mk_button("⏻ Salir", "secondary")
	out.pressed.connect(func() -> void: Store.logout(); show_screen("login"))
	for b in [play, snd, theme_btn, fs, out]:
		s.add_child(b)

func open_menu() -> void:
	menu_user.text = "Sesión iniciada como: %s" % Store.user
	show_screen("menu")

func _build_partidas() -> void:
	var s := mk_screen("partidas")
	s.alignment = BoxContainer.ALIGNMENT_BEGIN
	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", 12)
	var back := mk_button("← Volver", "secondary")
	back.custom_minimum_size = Vector2(120, 40)
	back.pressed.connect(open_menu)
	head.add_child(back)
	head.add_child(mk_label("Elige tu rascador", 24))
	s.add_child(head)
	worlds_row = HBoxContainer.new()
	worlds_row.add_theme_constant_override("separation", 12)
	s.add_child(worlds_row)
	screens_title = mk_label("", 18)
	s.add_child(screens_title)
	screens_row = VBoxContainer.new()
	screens_row.add_theme_constant_override("separation", 10)
	s.add_child(screens_row)
	# modal
	modal_overlay = Control.new()
	modal_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	modal_overlay.visible = false
	var bg := ColorRect.new()
	bg.color = Color(0, 0, 0, 0.6)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	modal_overlay.add_child(bg)
	var mp := mk_panel()
	mp.custom_minimum_size = Vector2(360, 0)
	var mv := VBoxContainer.new()
	mv.add_theme_constant_override("separation", 10)
	modal_title = mk_label("", 18, true)
	modal_info = mk_label("", 13, true)
	modal_recipes = mk_label("", 13, true)
	modal_controls = mk_label("WASD/flechas: moverse · E: interactuar · Q: tirar · Esc: pausa · entrega en la ENTREGA (derecha)", 11, true)
	var start := mk_button("▶ Empezar partida")
	start.pressed.connect(_on_modal_start)
	var close := mk_button("✖ Cerrar", "danger")
	close.pressed.connect(func() -> void: modal_overlay.visible = false)
	for n in [modal_title, modal_info, modal_recipes, modal_controls]:
		mv.add_child(n)
	mv.add_child(start)
	mv.add_child(close)
	mp.add_child(mv)
	var center := CenterContainer.new()
	center.name = "Center"
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	center.add_child(mp)
	modal_overlay.add_child(center)
	s.add_child(modal_overlay)

func render_partidas() -> void:
	for c in worlds_row.get_children():
		c.queue_free()
	for w in Data.worlds():
		var card := mk_panel()
		var cv := VBoxContainer.new()
		cv.add_theme_constant_override("separation", 4)
		cv.add_child(mk_label(w["emoji"], 40, true))
		cv.add_child(mk_label(w["name"], 13, true))
		card.add_child(cv)
		card.gui_input.connect(func(ev: InputEvent) -> void:
			var mb := ev as InputEventMouseButton
			if mb != null and mb.pressed:
				selected_world = w
				render_partidas())
		worlds_row.add_child(card)
	screens_title.text = "%s %s — elige pantalla" % [selected_world["emoji"], selected_world["name"]]
	for c in screens_row.get_children():
		c.queue_free()
	for i in selected_world["screens"].size():
		var sc: Dictionary = selected_world["screens"][i]
		var unlocked := Store.is_screen_unlocked(selected_world, i)
		var p: Dictionary = Store.progress.get(sc["id"], {})
		var th: Dictionary = Cfg.screen_medals(sc["id"])
		var card := mk_panel()
		if not unlocked:
			card.modulate = Color(1, 1, 1, 0.55)
		var cv := VBoxContainer.new()
		cv.add_theme_constant_override("separation", 2)
		cv.add_child(mk_label("PISO %d · %s" % [i + 1, sc["name"].split("·")[-1].strip_edges()], 15, true))
		cv.add_child(mk_label("🐾" if unlocked else "🔒", 28, true))
		var medal := String(p.get("medal", ""))
		var badge := mk_label(("🐟 atún de %s" % Store.MEDAL_LABEL[medal]) if medal != "" else "sin atún", 12, true)
		if medal != "":
			badge.add_theme_color_override("font_color", Store.MEDAL_COLOR[medal])
		cv.add_child(badge)
		var best := int(p.get("bestCans", -1))
		cv.add_child(mk_label("🐟 %d/%d" % [best, th["gold"]] if best >= 0 else "sin jugar", 11, true))
		card.add_child(cv)
		if unlocked:
			card.gui_input.connect(func(ev: InputEvent) -> void:
				var mb := ev as InputEventMouseButton
				if mb != null and mb.pressed:
					open_modal(sc))
		screens_row.add_child(card)

func open_modal(sc: Dictionary) -> void:
	modal_screen = sc
	var mins := int(round(Cfg.screen_duration(sc["id"]) / 60.0))
	var m: Dictionary = Cfg.screen_medals(sc["id"])
	modal_title.text = sc["name"]
	modal_info.text = "Duración: %d min · Atún: bronce %d 🐟 · plata %d 🐟 · oro %d 🐟 · propina ×%s" % [mins, m["bronze"], m["silver"], m["gold"], Cfg.tip_multiplier()]
	var seen := {}
	var rec := ""
	for d in sc["pool"]:
		if seen.has(d["recipeId"]):
			continue
		seen[d["recipeId"]] = true
		var r: Dictionary = Data.RECIPES[d["recipeId"]]
		rec += "%s %s   " % [r["emoji"], r["name"]]
	modal_recipes.text = "Recetas: " + rec
	modal_overlay.visible = true

func _on_modal_start() -> void:
	if modal_screen.is_empty():
		return
	modal_overlay.visible = false
	last_match = {"worldId": selected_world["id"], "screenId": modal_screen["id"]}
	start_match(selected_world["id"], modal_screen["id"])

func _build_results() -> void:
	var s := mk_screen("results")
	s.add_child(mk_label("⏱️ ¡Tiempo! Resultados", 26))
	results_screen_lbl = mk_label("", 15)
	results_score = mk_label("", 18)
	results_medal = mk_label("", 18)
	s.add_child(results_screen_lbl)
	s.add_child(results_score)
	s.add_child(results_medal)
	results_cans = HBoxContainer.new()
	results_cans.alignment = BoxContainer.ALIGNMENT_CENTER
	results_cans.add_theme_constant_override("separation", 30)
	s.add_child(results_cans)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 12)
	var again := mk_button("↻ Volver a jugar")
	again.pressed.connect(func() -> void: start_match(last_match["worldId"], last_match["screenId"]))
	var exit := mk_button("⇩ Salir", "secondary")
	exit.pressed.connect(func() -> void: render_partidas(); show_screen("partidas"))
	row.add_child(again)
	row.add_child(exit)
	s.add_child(row)

func _build_overlays() -> void:
	pause_overlay = _make_overlay("⏸ Pausa")
	pause_overlay.process_mode = Node.PROCESS_MODE_ALWAYS
	var pv := pause_overlay.get_node("Center/Panel").get_node("VBox")
	var cont := mk_button("▶ Continuar")
	cont.pressed.connect(toggle_pause)
	var snd := mk_button("🔊 Sonido", "secondary")
	snd.pressed.connect(func() -> void: sound_overlay.visible = true)
	var quit := mk_button("⇩ Salir a partidas", "secondary")
	quit.pressed.connect(quit_to_partidas)
	for b in [cont, snd, quit]:
		pv.add_child(b)

	sound_overlay = _make_overlay("🔊 Sonido")
	sound_overlay.process_mode = Node.PROCESS_MODE_ALWAYS
	var sv := sound_overlay.get_node("Center/Panel").get_node("VBox")
	var music := _slider_row(sv, "🎵 Música", Cfg.vol_music)
	var sfx := _slider_row(sv, "🔔 Efectos", Cfg.vol_sfx)
	music.value_changed.connect(func(v: float) -> void: Cfg.set_volumes(v / 100.0, Cfg.vol_sfx))
	sfx.value_changed.connect(func(v: float) -> void: Cfg.set_volumes(Cfg.vol_music, v / 100.0))
	var close := mk_button("✔ Cerrar", "secondary")
	close.pressed.connect(func() -> void: sound_overlay.visible = false)
	sv.add_child(close)

func _make_overlay(title: String) -> Control:
	var o := Control.new()
	o.set_anchors_preset(Control.PRESET_FULL_RECT)
	o.visible = false
	var bg := ColorRect.new()
	bg.color = Color(0, 0, 0, 0.65)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	o.add_child(bg)
	var center := CenterContainer.new()
	center.name = "Center"
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	var p := mk_panel()
	p.name = "Panel"
	p.custom_minimum_size = Vector2(300, 0)
	var v := VBoxContainer.new()
	v.name = "VBox"
	v.add_theme_constant_override("separation", 12)
	v.add_child(mk_label(title, 20, true))
	p.add_child(v)
	center.add_child(p)
	o.add_child(center)
	add_child(o)
	return o

func _slider_row(parent: Control, text: String, value: float) -> HSlider:
	var l := mk_label(text, 14, true)
	parent.add_child(l)
	var s := HSlider.new()
	s.min_value = 0
	s.max_value = 100
	s.value = value * 100
	s.custom_minimum_size = Vector2(260, 0)
	parent.add_child(s)
	return s

# ---------------------------------------------------------------- HUD

func _build_hud() -> void:
	hud_layer = CanvasLayer.new()
	hud_layer.visible = false
	add_child(hud_layer)
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud_layer.add_child(root)
	# barra superior
	var top := PanelContainer.new()
	top.set_anchors_preset(Control.PRESET_TOP_WIDE)
	top.custom_minimum_size = Vector2(0, 52)
	all_panels.append(top)
	UiStyle.style_panel(top, theme_id)
	var hb := HBoxContainer.new()
	hb.add_theme_constant_override("separation", 10)
	hud_level = mk_label("", 13)
	hud_score = mk_label("", 13)
	hud_cans = mk_label("", 13)
	hud_held = mk_label("", 13)
	hud_time = mk_label("3:00", 18)
	for l in [hud_level, hud_score, hud_cans, hud_held, hud_time]:
		hb.add_child(l)
	var spacer := Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hb.add_child(spacer)
	var pause_btn := mk_button("⏸", "secondary")
	pause_btn.custom_minimum_size = Vector2(44, 36)
	pause_btn.pressed.connect(toggle_pause)
	hud_theme_btn = mk_button("🎨", "secondary")
	hud_theme_btn.custom_minimum_size = Vector2(44, 36)
	hud_theme_btn.pressed.connect(toggle_theme)
	var fs_btn := mk_button("⛶", "secondary")
	fs_btn.custom_minimum_size = Vector2(44, 36)
	fs_btn.pressed.connect(toggle_fullscreen)
	for b in [pause_btn, hud_theme_btn, fs_btn]:
		hb.add_child(b)
	top.add_child(hb)
	root.add_child(top)
	# barra de tiempo global
	var timebar := ColorRect.new()
	timebar.color = Color(0, 0, 0, 0.4)
	timebar.set_anchors_preset(Control.PRESET_TOP_WIDE)
	timebar.offset_top = 52
	timebar.custom_minimum_size = Vector2(0, 4)
	root.add_child(timebar)
	hud_timebar_fill = ColorRect.new()
	hud_timebar_fill.color = Color("e8e2f5")
	hud_timebar_fill.anchor_right = 1.0
	hud_timebar_fill.custom_minimum_size = Vector2(0, 4)
	timebar.add_child(hud_timebar_fill)
	# pedidos
	hud_orders = VBoxContainer.new()
	hud_orders.position = Vector2(8, 60)
	hud_orders.add_theme_constant_override("separation", 6)
	root.add_child(hud_orders)
	for i in 3:
		var card := mk_panel()
		card.custom_minimum_size = Vector2(220, 0)
		var cv := VBoxContainer.new()
		cv.add_theme_constant_override("separation", 2)
		var main := mk_label("", 12, true)
		var rem := mk_label("", 11, true)
		var bar := ProgressBar.new()
		bar.custom_minimum_size = Vector2(0, 7)
		bar.max_value = 100
		bar.show_percentage = false
		cv.add_child(main)
		cv.add_child(rem)
		cv.add_child(bar)
		card.add_child(cv)
		card.visible = false
		hud_orders.add_child(card)
		order_cards.append({"card": card, "main": main, "rem": rem, "bar": bar})
	# progreso (mortero/limpieza)
	hud_progress_label = mk_label("", 12)
	hud_progress_label.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	hud_progress_label.position = Vector2(-100, -48)
	hud_progress_label.custom_minimum_size = Vector2(200, 0)
	hud_progress_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hud_progress_label.visible = false
	root.add_child(hud_progress_label)
	hud_progress = ProgressBar.new()
	hud_progress.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	hud_progress.position = Vector2(-100, -30)
	hud_progress.custom_minimum_size = Vector2(200, 14)
	hud_progress.max_value = 100
	hud_progress.show_percentage = false
	hud_progress.visible = false
	root.add_child(hud_progress)
	# hint
	hud_hint = mk_label("", 14)
	hud_hint.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	hud_hint.position = Vector2(-480, -10)
	hud_hint.custom_minimum_size = Vector2(960, 0)
	hud_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(hud_hint)
	# controles táctiles
	touch_controls = Control.new()
	touch_controls.set_anchors_preset(Control.PRESET_FULL_RECT)
	touch_controls.visible = DisplayServer.has_feature(DisplayServer.FEATURE_TOUCHSCREEN)
	root.add_child(touch_controls)
	joy_base = Panel.new()
	joy_base.custom_minimum_size = Vector2(120, 120)
	joy_base.position = Vector2(30, 640 - 30 - 120)
	var jb := StyleBoxFlat.new()
	jb.bg_color = Color(1, 1, 1, 0.12)
	jb.set_corner_radius_all(60)
	joy_base.add_theme_stylebox_override("panel", jb)
	joy_base.gui_input.connect(_on_joy_gui)
	touch_controls.add_child(joy_base)
	joy_stick = Panel.new()
	joy_stick.custom_minimum_size = Vector2(48, 48)
	joy_stick_home = Vector2(36, 36)
	joy_stick.position = joy_stick_home
	var js := StyleBoxFlat.new()
	js.bg_color = Color(1, 1, 1, 0.35)
	js.set_corner_radius_all(24)
	joy_stick.add_theme_stylebox_override("panel", js)
	joy_base.add_child(joy_stick)
	var tb := HBoxContainer.new()
	tb.position = Vector2(960 - 30 - 170, 640 - 30 - 76)
	tb.add_theme_constant_override("separation", 16)
	var qb := mk_button("Q", "secondary")
	qb.custom_minimum_size = Vector2(76, 76)
	qb.pressed.connect(func() -> void: touch["q_just"] = true)
	var eb := mk_button("E", "secondary")
	eb.custom_minimum_size = Vector2(76, 76)
	eb.pressed.connect(func() -> void: touch["e_down"] = true; touch["e_just"] = true)
	eb.button_up.connect(func() -> void: touch["e_down"] = false)
	tb.add_child(qb)
	tb.add_child(eb)
	touch_controls.add_child(tb)

func _on_joy_gui(ev: InputEvent) -> void:
	var t := ev as InputEventScreenTouch
	if t != null:
		if t.pressed:
			joy_pointer = t.index
			joy_center = joy_base.get_global_rect().get_center()
		elif t.index == joy_pointer:
			joy_pointer = -1
			touch["vec"] = Vector2.ZERO
			joy_stick.position = joy_stick_home
		return
	var d_ev := ev as InputEventScreenDrag
	if d_ev != null and d_ev.index == joy_pointer:
		var d: Vector2 = d_ev.position - joy_center
		if d.length() > 48:
			d = d.normalized() * 48
		touch["vec"] = d / 48.0
		joy_stick.position = joy_stick_home + d

func show_hud() -> void:
	hud_layer.visible = true
	for c in order_cards:
		c["card"].visible = false

func hide_hud() -> void:
	hud_layer.visible = false
	touch_controls.visible = false

func _on_hud_update(h: Dictionary) -> void:
	hud_level.text = h["levelName"]
	hud_score.text = "Puntos: %d" % h["score"]
	hud_cans.text = "🐟 %d latas" % h["cans"]
	hud_held.text = ("🐾 %s" % h["held"]) if h["held"] != "" else ""
	var s := int(ceil(max(0.0, h["timeLeft"])))
	hud_time.text = "%d:%02d" % [s / 60, s % 60]
	hud_time.add_theme_color_override("font_color", Color("ff6b6b") if s <= 30 else Color("7ee081"))
	var total: float = maxf(1.0, float(h["timeTotal"]))
	hud_timebar_fill.anchor_right = clampf(h["timeLeft"] / total, 0.0, 1.0)
	var r: float = float(h["timeLeft"]) / total
	hud_timebar_fill.color = Color("e8e2f5") if r > 0.5 else (Color("f5a623") if r > 30.0 / total else Color("ff5252"))
	hud_hint.text = h["hint"]
	for i in order_cards.size():
		var c: Dictionary = order_cards[i]
		var o = h["orders"][i] if i < h["orders"].size() else null
		if o == null:
			c["card"].visible = false
			continue
		c["card"].visible = true
		c["main"].text = "%s %s" % [o["emoji"], o["name"]]
		c["rem"].text = ("Falta: %s" % o["remaining"]) if o["remaining"] != "" else "¡Lista para entregar!"
		c["bar"].value = clampf(o["timeLeft"] / max(1.0, o["timeLimit"]), 0.0, 1.0) * 100.0
	hud_progress.visible = h["showProgress"]
	hud_progress_label.visible = h["showProgress"]
	if h["showProgress"]:
		hud_progress.value = h["progress"] * 100.0
		hud_progress_label.text = h["progressLabel"]

# ---------------------------------------------------------------- partida

func start_match(world_id: String, screen_id: String) -> void:
	stop_match()
	for k in screens:
		screens[k].visible = false
	show_hud()
	if touch_controls:
		touch_controls.visible = DisplayServer.has_feature(DisplayServer.FEATURE_TOUCHSCREEN)
	var m: Node2D = load("res://scripts/match.gd").new()
	cur_match = m
	m.world_id = world_id
	m.screen_id = screen_id
	m.touch = touch
	m.game_over.connect(_on_game_over)
	m.hud_update.connect(_on_hud_update)
	m.pause_requested.connect(toggle_pause)
	add_child(m)

func stop_match() -> void:
	if cur_match:
		cur_match.queue_free()
		cur_match = null

func _on_game_over(detail: Dictionary) -> void:
	paused = false
	get_tree().paused = false
	pause_overlay.visible = false
	stop_match()
	hide_hud()
	last_match = {"worldId": detail["worldId"], "screenId": detail["screenId"]}
	var world: Dictionary = Data.worlds().filter(func(w: Dictionary) -> bool: return w["id"] == detail["worldId"])[0]
	var sc: Dictionary = world["screens"].filter(func(x: Dictionary) -> bool: return x["id"] == detail["screenId"])[0]
	var medal := Store.medal_for(detail["cans"], Cfg.screen_medals(sc["id"]))
	Store.record_result(sc["id"], detail["cans"], medal)
	render_results(detail, sc, medal)
	show_screen("results")

func render_results(d: Dictionary, sc: Dictionary, medal: String) -> void:
	results_screen_lbl.text = sc["name"]
	results_score.text = "Puntos: %d    🐟 Latas de atún ganadas: %d" % [d["score"], d["cans"]]
	results_medal.text = ("🐟 Atún de %s conseguido" % Store.MEDAL_LABEL[medal]) if medal != "" else "Sin atún esta vez"
	results_medal.add_theme_color_override("font_color", Store.MEDAL_COLOR[medal] if medal != "" else Color("ff6b6b"))
	for c in results_cans.get_children():
		c.queue_free()
	var t: Dictionary = Cfg.screen_medals(sc["id"])
	var thresholds := [t["bronze"], t["silver"], t["gold"]]
	var colors := [Color("cd7f32"), Color("c0c0c0"), Color("ffd700")]
	var labels := ["Atún bronce", "Atún plata", "Atún oro"]
	for i in 3:
		var wrap := VBoxContainer.new()
		wrap.alignment = BoxContainer.ALIGNMENT_END
		var can := ColorRect.new()
		can.color = colors[i]
		can.custom_minimum_size = Vector2(56, 80)
		var fill := ColorRect.new()
		fill.color = colors[i].lightened(0.35)
		var frac := clampf(float(d["cans"]) / float(thresholds[i]), 0.0, 1.0)
		fill.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
		fill.anchor_top = 1.0 - frac
		can.add_child(fill)
		var shown := mini(int(d["cans"]), int(thresholds[i])) if i < 2 else int(d["cans"])
		wrap.add_child(can)
		wrap.add_child(mk_label(labels[i], 12, true))
		wrap.add_child(mk_label("%d/%d 🐟" % [shown, thresholds[i]], 12, true))
		results_cans.add_child(wrap)

func toggle_pause() -> void:
	if cur_match == null:
		return
	paused = not paused
	get_tree().paused = paused
	pause_overlay.visible = paused

func quit_to_partidas() -> void:
	paused = false
	get_tree().paused = false
	pause_overlay.visible = false
	stop_match()
	hide_hud()
	render_partidas()
	show_screen("partidas")
