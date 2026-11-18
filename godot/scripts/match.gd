extends Node2D

const Data = preload("res://scripts/data.gd")
## Partida (equivalente a GameScene.ts + Player/Station/Cauldron/OrderSystem): tablero isométrico,
## estaciones, caldero con estados, pedidos continuos, mortero automático, entrega en la ENTREGA,
## temporizador de 3 min y HUD vía señales. Se crea/destruye por partida (como session.ts).

signal game_over(detail: Dictionary)
signal hud_update(state: Dictionary)
signal pause_requested

var world_id := "torre"
var screen_id := "torre-s1"
var world: Dictionary
var screen: Dictionary
var touch: Dictionary = {"vec": Vector2.ZERO, "e_down": false, "e_just": false, "q_just": false}

var tex := {}
var player_pos := Vector2(480, 560)
var player_item = null  # {"kind": "ingredient"/"potion"/"wand", ...}
var sprite: AnimatedSprite2D
var held_label: Label
var held_icon: Sprite2D
var stations: Array = []  # {kind, pos, ingredient, icon, marker, hit}
var cauldron := {}
var mortar_slot = null  # {ingredient, progress}
var orders: Array = []   # {recipe, timeLeft, timeLimit}
var score := 0
var cans := 0
var time_left := 180.0
var over := false
var hint := ""
var e_was := false
var q_was := false
var p_was := false
var bubble_clock := 0.0
var sfx_player: AudioStreamPlayer

func _ready() -> void:
	world = Data.worlds().filter(func(w: Dictionary) -> bool: return w["id"] == world_id)[0]
	screen = world["screens"].filter(func(s: Dictionary) -> bool: return s["id"] == screen_id)[0]
	for n in ["floor", "floor-b", "base", "station-mortar", "station-counter", "station-wand", "station-ingredient",
		"cauldron", "cauldron-ready", "cauldron-boom", "char-hat", "star",
		"ing-catnip", "ing-hairball", "ing-meow3am", "ing-fairyDust", "ing-sirenTear", "ing-scratcherRope",
		"potion-ronroneo", "potion-antiPelos", "potion-sirena", "potion-montes"]:
		tex[n] = load("res://assets/%s.png" % n)
	for i in 10:
		tex["char-run%d" % i] = load("res://assets/char-run%d.png" % i)
	_build()
	time_left = Cfg.screen_duration(screen_id)
	hint = "Coge ingredientes (E) · cocina en el caldero · entrega la poción lista en la ENTREGA (derecha)"
	_update_orders(0.0)
	sfx_player = AudioStreamPlayer.new()
	add_child(sfx_player)
	_emit_hud()

# ------------------------------------------------------------------ build

func _build() -> void:
	queue_redraw()
	var used := {}
	for d in screen["pool"]:
		for s in Data.RECIPES[d["recipeId"]]["steps"]:
			used[s] = true
	for l in screen["layout"]:
		if l["kind"] == "cauldron":
			_build_cauldron(l)
		elif l["kind"] == "ingredient" and l.has("ingredient") and not used.has(l["ingredient"]):
			continue
		else:
			_build_station(l)
	_build_player()

func _draw() -> void:
	for row in 26:
		for col in 18:
			var t: Texture2D = tex["floor"] if (row + col) % 2 == 0 else tex["floor-b"]
			draw_texture(t, Vector2(col * 64 + (row % 2) * 32 - 32, 56 + row * 24))

func _mk_label(text: String, size: int, color: Color, outline := true) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	if outline:
		l.add_theme_color_override("font_outline_color", Color.BLACK)
		l.add_theme_constant_override("outline_size", 2)
	return l

func _build_station(l: Dictionary) -> void:
	var pos := Vector2(l["x"], l["y"])
	var n := Node2D.new()
	n.position = pos
	var base := Sprite2D.new()
	base.texture = tex["base"]
	base.position = Vector2(0, 8)
	base.z_index = 5
	n.add_child(base)
	var icon_map := {"ingredient": "station-ingredient", "mortar": "station-mortar",
		"counter": "station-counter", "wandRack": "station-wand", "cauldron": "cauldron"}
	var icon_key: String = icon_map.get(l["kind"], "station-ingredient")
	var icon := Sprite2D.new()
	icon.texture = tex[icon_key]
	icon.position = Vector2(0, -10)
	icon.z_index = 10
	n.add_child(icon)
	var marker: Sprite2D = null
	if l["kind"] == "ingredient":
		var ing := Sprite2D.new()
		ing.texture = tex["ing-%s" % l["ingredient"]]
		ing.position = Vector2(0, -26)
		ing.scale = Vector2(0.75, 0.75)
		ing.z_index = 11
		n.add_child(ing)
	elif l["kind"] == "counter":
		marker = Sprite2D.new()
		marker.texture = tex["star"]
		marker.position = Vector2(0, -46)
		marker.z_index = 12
		n.add_child(marker)
	var label := _mk_label(l.get("label", _default_label(l["kind"])), 11, Color("cfc4e8"))
	label.position = Vector2(-80, 28)
	label.custom_minimum_size = Vector2(160, 0)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	n.add_child(label)
	add_child(n)
	stations.append({
		"kind": l["kind"], "pos": pos, "ingredient": l.get("ingredient", ""),
		"icon": icon, "marker": marker, "hit": Rect2(pos.x - 40, pos.y - 24, 80, 56),
	})

func _default_label(kind: String) -> String:
	match kind:
		"mortar": return "Mortero (muele)"
		"cauldron": return "Caldero"
		"counter": return "ENTREGA de pedidos"
		"wandRack": return "Varita Miaugica"
	return ""

func _build_cauldron(l: Dictionary) -> void:
	var pos := Vector2(l["x"], l["y"])
	var st := {"kind": "cauldron", "pos": pos, "hit": Rect2(pos.x - 40, pos.y - 24, 80, 56)}
	_build_station({"kind": "cauldron", "x": l["x"], "y": l["y"]})
	var last: Dictionary = stations[-1]
	st["icon"] = last["icon"]
	st["marker"] = null
	var status := _mk_label("", 12, Color("ffe08a"))
	status.position = Vector2(pos.x - 80, pos.y - 48)
	status.custom_minimum_size = Vector2(160, 0)
	status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(status)
	cauldron = {"state": "empty", "contents": [], "recipe": null, "cookLeft": 0.0, "burnLeft": 0.0,
		"cleanProgress": 0.0, "station": st, "status": status}
	stations.append(st)

func _build_player() -> void:
	sprite = AnimatedSprite2D.new()
	var sf := SpriteFrames.new()
	sf.add_animation("run")
	sf.set_animation_speed("run", 12.0)
	for i in 10:
		sf.add_frame("run", tex["char-run%d" % i])
	sf.add_animation("idle")
	sf.add_frame("idle", tex["char-hat"])
	sprite.sprite_frames = sf
	sprite.position = player_pos
	sprite.z_index = 20
	add_child(sprite)
	held_label = _mk_label("", 22, Color.WHITE)
	held_label.position = player_pos + Vector2(0, -118)
	held_label.z_index = 21
	add_child(held_label)
	held_icon = Sprite2D.new()
	held_icon.texture = tex["potion-ronroneo"]
	held_icon.position = player_pos + Vector2(0, -118)
	held_icon.scale = Vector2(0.9, 0.9)
	held_icon.visible = false
	held_icon.z_index = 21
	add_child(held_icon)

# ------------------------------------------------------------------ update

func _process(delta: float) -> void:
	if over:
		return
	time_left -= delta
	if time_left <= 0:
		time_left = 0
		_end_match()
		return
	var cfg: Dictionary = Cfg.config
	var tv: Vector2 = touch["vec"]
	var ix: float = (1.0 if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT) else 0.0) \
		- (1.0 if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT) else 0.0) + tv.x
	var iy: float = (1.0 if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN) else 0.0) \
		- (1.0 if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP) else 0.0) + tv.y
	var v := Vector2(ix, iy)
	if v.length() > 1:
		v = v.normalized()
	if v.length() > 0.05:
		if not sprite.is_playing():
			sprite.play("run")
	else:
		if sprite.is_playing():
			sprite.stop()
		sprite.animation = "idle"
		sprite.frame = 0
	var speed := float(cfg["player"]["speed"])
	var nx := player_pos.x + v.x * speed * delta
	var ny := player_pos.y + v.y * speed * delta
	if not _collides(nx, player_pos.y):
		player_pos.x = nx
	if not _collides(player_pos.x, ny):
		player_pos.y = ny
	player_pos.x = clampf(player_pos.x, 40, 920)
	player_pos.y = clampf(player_pos.y, 120, 600)
	sprite.position = player_pos
	held_label.position = player_pos + Vector2(0, -118)
	held_icon.position = player_pos + Vector2(0, -118)
	_refresh_held()

	var near = _nearest(float(cfg["interaction"]["distance"]))
	var e_down: bool = Input.is_key_pressed(KEY_E) or bool(touch["e_down"]) or bool(touch["e_just"])
	var q_down: bool = Input.is_key_pressed(KEY_Q) or bool(touch["q_just"])
	if e_down and not e_was and near != null:
		_interact(near)
	if q_down and not q_was:
		_drop_item()
	e_was = e_down
	q_was = q_down
	# limpiar caldero exploded manteniendo E con la varita
	if near != null and near["kind"] == "cauldron" and cauldron["state"] == "exploded" \
		and player_item != null and player_item["kind"] == "wand" and e_down:
		cauldron["cleanProgress"] += delta / float(cfg["interaction"]["cleanSeconds"])
		if cauldron["cleanProgress"] >= 1.0:
			cauldron["state"] = "empty"
			cauldron["cleanProgress"] = 0.0
			cauldron["icon"].texture = tex["cauldron"]
			player_item = null
			sfx("clean")
			hint = "Caldero limpio ✨. La varita vuelve a su sitio."
	var p_down := Input.is_key_pressed(KEY_ESCAPE) or Input.is_key_pressed(KEY_P)
	if p_down and not p_was:
		pause_requested.emit()
	p_was = p_down

	_update_orders(delta)
	_update_cauldron(delta)
	_update_mortar(delta)
	_update_marker()
	_emit_hud()
	if OS.get_cmdline_user_args().has("--verbose-match") and Engine.get_process_frames() % 300 == 0:
		print("[match] t=%.0fs pos=%s orders=%d cauldron=%s item=%s hint=%s" % [
			180.0 - time_left, player_pos, orders.size(), cauldron["state"], player_item, hint])
	touch["e_just"] = false
	touch["q_just"] = false

func _collides(x: float, y: float) -> bool:
	var r := 14.0
	for s in stations:
		var h: Rect2 = s["hit"]
		if x + r > h.position.x and x - r < h.end.x and y + r > h.position.y and y - r < h.end.y:
			return true
	return false

func _nearest(max_dist: float):
	var best = null
	var best_d := max_dist
	for s in stations:
		var d := player_pos.distance_to(s["pos"])
		if d < best_d:
			best_d = d
			best = s
	return best

# ------------------------------------------------------------------ interacciones

func _interact(st: Dictionary) -> void:
	match st["kind"]:
		"ingredient": _interact_ingredient(st)
		"wandRack": _interact_wand()
		"counter": _interact_counter(st)
		"cauldron": _interact_cauldron()
		"mortar": _interact_mortar()

func _interact_ingredient(st: Dictionary) -> void:
	if player_item == null and st["ingredient"] != "":
		player_item = {"kind": "ingredient", "ingredient": st["ingredient"], "processed": false}
		sfx("pickup")
		hint = "Cogiste %s %s" % [Data.INGREDIENTS[st["ingredient"]]["name"], Data.INGREDIENTS[st["ingredient"]]["emoji"]]
	elif player_item != null:
		hint = "Ya llevas algo en las manos"

func _interact_wand() -> void:
	if player_item == null:
		player_item = {"kind": "wand"}
		sfx("pickup")
		hint = "Varita Miaugica 🪄 en mano"
	else:
		hint = "Ya llevas algo en las manos"

func _interact_counter(st: Dictionary) -> void:
	if player_item != null and player_item["kind"] == "potion":
		var res := _try_deliver(player_item["potionId"])
		if res["ok"]:
			score += res["points"]
			cans += res["cans"]
			player_item = null
			sfx("deliver")
			hint = "¡Entregado! %s 🧪" % res["recipe"]["name"]
		else:
			sfx("fail")
			hint = "Ningún pedido espera esa poción ahora (Q para tirarla)"
	else:
		hint = "Lleva la poción 🧪 a la ENTREGA (derecha, bajo la ⭐)"

func _interact_cauldron() -> void:
	if player_item != null and player_item["kind"] == "ingredient":
		var res: String = _cauldron_add(player_item["ingredient"], player_item.get("processed", false))
		if res == "ok":
			player_item = null
			sfx("drop")
			hint = "Al caldero 🍲"
		elif res == "needsPrep":
			var def: Dictionary = Data.INGREDIENTS[player_item["ingredient"]]
			hint = "Eso va directo al caldero" if def["prep"] == "none" else "Primero muélelo en el mortero 🥣"
		else:
			player_item = null
			_cauldron_explode()
	elif cauldron["state"] == "ready" and player_item == null:
		var pid: String = _cauldron_take()
		if pid != "":
			player_item = {"kind": "potion", "potionId": pid}
			sfx("ready")
			hint = "🧪 %s en frasco de cristal" % Data.RECIPES[pid]["name"]
	elif cauldron["state"] == "exploded":
		hint = "Mantén E para limpiar con la varita 🪄" if (player_item != null and player_item["kind"] == "wand") else "¡Explotó! Coge la varita 🪄 del soporte"
	elif cauldron["state"] == "cooking" and player_item == null:
		_cauldron_clear()
		sfx("drop")
		hint = "Mezcla tirada. El caldero vuelve a estar vacío 🍲"
	else:
		hint = "El caldero está vacío: echa un ingrediente de un pedido activo"

func _interact_mortar() -> void:
	var slot = mortar_slot
	if player_item != null and player_item["kind"] == "ingredient" and not player_item.get("processed", false):
		var def: Dictionary = Data.INGREDIENTS[player_item["ingredient"]]
		if def["prep"] != "mortar":
			hint = "Eso va directo al caldero, no se muele"
		elif slot != null:
			hint = "El mortero está ocupado"
		else:
			mortar_slot = {"ingredient": player_item["ingredient"], "progress": 0.0}
			player_item = null
			sfx("drop")
			hint = "%s %s en el mortero 🥣 — se muele solo, puedes ir al caldero" % [def["name"], def["emoji"]]
	elif player_item == null and slot != null:
		if slot["progress"] >= float(Cfg.config["interaction"]["processSeconds"]):
			player_item = {"kind": "ingredient", "ingredient": slot["ingredient"], "processed": true}
			mortar_slot = null
			sfx("pickup")
			var def: Dictionary = Data.INGREDIENTS[player_item["ingredient"]]
			hint = "%s %s molido ✅. Al caldero 🍲" % [def["name"], def["emoji"]]
		else:
			hint = "Se está moliendo en el mortero 🥣..."
	else:
		hint = "Deja un ingrediente aquí (E) o recógelo molido (E)"

func _drop_item() -> void:
	if player_item == null:
		return
	var label := ""
	if player_item["kind"] == "potion":
		label = "la poción 🧪"
	elif player_item["kind"] == "wand":
		label = "la varita 🪄"
	else:
		label = "%s %s" % [Data.INGREDIENTS[player_item["ingredient"]]["name"], Data.INGREDIENTS[player_item["ingredient"]]["emoji"]]
	player_item = null
	sfx("drop")
	hint = "Tiraste %s (Q)" % label

# ------------------------------------------------------------------ caldero

func _cauldron_add(id: String, processed: bool) -> String:
	if cauldron["state"] == "exploded" or cauldron["state"] == "ready":
		return "busy"
	var def: Dictionary = Data.INGREDIENTS[id]
	if def["prep"] != "none" and not processed:
		return "needsPrep"
	if cauldron["contents"].has(id):
		return "wrong"
	var candidates: Array = []
	for o in orders:
		var r: Dictionary = o["recipe"]
		if r["steps"].has(id) and cauldron["contents"].all(func(c: String) -> bool: return r["steps"].has(c)):
			candidates.append(r)
	if candidates.is_empty():
		return "wrong"
	cauldron["contents"].append(id)
	candidates.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return a["steps"].size() < b["steps"].size())
	cauldron["recipe"] = candidates[0]
	if cauldron["state"] == "empty":
		cauldron["state"] = "cooking"
		cauldron["burnLeft"] = float(cauldron["recipe"]["burnTime"])
	if cauldron["contents"].size() == cauldron["recipe"]["steps"].size():
		cauldron["cookLeft"] = float(cauldron["recipe"]["cookTime"])
	return "ok"

func _update_cauldron(delta: float) -> void:
	if cauldron["state"] == "cooking":
		cauldron["burnLeft"] -= delta
		bubble_clock -= delta
		if bubble_clock <= 0:
			bubble_clock = 0.45
			sfx("bubble")
		if cauldron["cookLeft"] > 0:
			cauldron["cookLeft"] -= delta
			if cauldron["cookLeft"] <= 0:
				cauldron["cookLeft"] = 0.0
				cauldron["state"] = "ready"
				cauldron["burnLeft"] = float(Cfg.config["cauldron"]["readyExplodeSeconds"])
				sfx("ready")
				hint = "¡Poción lista! 🧪"
		if cauldron["burnLeft"] <= 0:
			_cauldron_explode()
	elif cauldron["state"] == "ready":
		cauldron["burnLeft"] -= delta
		if cauldron["burnLeft"] <= 0:
			_cauldron_explode()
	_cauldron_visual()

func _cauldron_explode() -> void:
	cauldron["state"] = "exploded"
	cauldron["contents"] = []
	cauldron["recipe"] = null
	cauldron["cookLeft"] = 0.0
	cauldron["cleanProgress"] = 0.0
	cauldron["station"]["icon"].texture = tex["cauldron-boom"]
	sfx("explode")
	hint = "¡El caldero explotó! Coge la varita 🪄 y límpialo (mantén E)"

func _cauldron_clear() -> void:
	if cauldron["state"] == "empty" or cauldron["state"] == "exploded":
		return
	cauldron["state"] = "empty"
	cauldron["contents"] = []
	cauldron["recipe"] = null
	cauldron["cookLeft"] = 0.0
	cauldron["burnLeft"] = 0.0
	cauldron["station"]["icon"].texture = tex["cauldron"]

func _cauldron_take() -> String:
	if cauldron["state"] != "ready" or cauldron["recipe"] == null:
		return ""
	var id: String = cauldron["recipe"]["id"]
	cauldron["state"] = "empty"
	cauldron["contents"] = []
	cauldron["recipe"] = null
	cauldron["burnLeft"] = 0.0
	cauldron["station"]["icon"].texture = tex["cauldron"]
	return id

func _cauldron_visual() -> void:
	var st: Dictionary = cauldron["station"]
	if cauldron["state"] == "exploded":
		st["icon"].texture = tex["cauldron-boom"]
	elif cauldron["state"] == "ready":
		st["icon"].texture = tex["cauldron-ready"]
	else:
		st["icon"].texture = tex["cauldron"]
	var status := ""
	if cauldron["state"] == "cooking":
		var icons := ""
		for c in cauldron["contents"]:
			icons += Data.INGREDIENTS[c]["emoji"] + " "
		var timer := ("%ds" % int(ceil(cauldron["cookLeft"]))) if cauldron["cookLeft"] > 0 else ("quema en %ds" % int(max(0, ceil(cauldron["burnLeft"]))))
		status = icons + " " + timer
	elif cauldron["state"] == "ready":
		status = "¡Lista! %ds" % int(max(0, ceil(cauldron["burnLeft"])))
	elif cauldron["state"] == "exploded":
		status = ("Limpiando %d%%" % int(cauldron["cleanProgress"] * 100)) if cauldron["cleanProgress"] > 0 else "¡Explotó! Usa la varita 🪄"
	cauldron["status"].text = status

# ------------------------------------------------------------------ pedidos

func _update_orders(delta: float) -> void:
	var max_active := int(screen["maxActiveOrders"])
	while orders.size() < max_active and not screen["pool"].is_empty():
		var def: Dictionary = screen["pool"][randi() % screen["pool"].size()]
		orders.append({"recipe": Data.RECIPES[def["recipeId"]], "timeLeft": float(def["timeLimit"]), "timeLimit": float(def["timeLimit"])})
	for i in range(orders.size() - 1, -1, -1):
		var o: Dictionary = orders[i]
		o["timeLeft"] -= delta
		if o["timeLeft"] <= 0:
			orders.remove_at(i)
			sfx("fail")
			hint = "Se acabó el tiempo de %s. ¡A por el siguiente!" % o["recipe"]["name"]

func _try_deliver(potion_id: String) -> Dictionary:
	for i in orders.size():
		if orders[i]["recipe"]["id"] == potion_id:
			var o: Dictionary = orders[i]
			orders.remove_at(i)
			var time_left_o: float = maxf(0.0, float(o["timeLeft"]))
			return {"ok": true, "points": int(o["recipe"]["basePoints"]),
				"cans": int(round(time_left_o * Cfg.tip_multiplier())), "recipe": o["recipe"]}
	return {"ok": false, "points": 0, "cans": 0, "recipe": null}

func _update_mortar(delta: float) -> void:
	if mortar_slot != null and mortar_slot["progress"] < float(Cfg.config["interaction"]["processSeconds"]):
		mortar_slot["progress"] += delta
		if mortar_slot["progress"] >= float(Cfg.config["interaction"]["processSeconds"]):
			mortar_slot["progress"] = float(Cfg.config["interaction"]["processSeconds"])
			sfx("process")
			var def: Dictionary = Data.INGREDIENTS[mortar_slot["ingredient"]]
			hint = "%s %s molido ✅ — E en el mortero para recogerlo" % [def["name"], def["emoji"]]

func _update_marker() -> void:
	for s in stations:
		if s["kind"] == "counter" and s["marker"] != null:
			var delivering: bool = player_item != null and player_item["kind"] == "potion"
			s["marker"].scale = Vector2.ONE * (1.25 + sin(Time.get_ticks_msec() / 120.0) * 0.18) if delivering else Vector2.ONE
			s["marker"].modulate.a = 1.0 if delivering else 0.75

func _refresh_held() -> void:
	if player_item != null and player_item["kind"] == "potion":
		held_label.text = ""
		held_icon.texture = tex["potion-%s" % player_item["potionId"]]
		held_icon.visible = true
	else:
		held_icon.visible = false
		held_label.text = _item_text(player_item)

func _item_text(item) -> String:
	if item == null:
		return ""
	match item["kind"]:
		"ingredient":
			var e: String = Data.INGREDIENTS[item["ingredient"]]["emoji"]
			return e + ("✅" if item.get("processed", false) else "")
		"potion": return "🧪"
		"wand": return "🪄"
	return ""

# ------------------------------------------------------------------ HUD / fin

func _emit_hud() -> void:
	var order_states: Array = []
	for o in orders:
		var remaining := ""
		for s in o["recipe"]["steps"]:
			if not cauldron["contents"].has(s):
				remaining += Data.INGREDIENTS[s]["emoji"]
		order_states.append({"emoji": o["recipe"]["emoji"], "name": o["recipe"]["name"],
			"timeLeft": max(0.0, o["timeLeft"]), "timeLimit": o["timeLimit"], "remaining": remaining})
	var near_now = _nearest(float(Cfg.config["interaction"]["distance"]))
	var cleaning: bool = cauldron["state"] == "exploded" and player_item != null and player_item["kind"] == "wand" \
		and near_now != null and near_now["kind"] == "cauldron"
	var grinding: bool = mortar_slot != null and mortar_slot["progress"] < float(Cfg.config["interaction"]["processSeconds"])
	hud_update.emit({
		"levelName": screen["name"], "score": score, "cans": cans,
		"timeLeft": max(0.0, time_left), "timeTotal": Cfg.screen_duration(screen_id),
		"orders": order_states, "held": _item_text(player_item), "hint": hint,
		"showProgress": cleaning or grinding,
		"progress": (cauldron["cleanProgress"] if cleaning else (mortar_slot["progress"] / float(Cfg.config["interaction"]["processSeconds"]) if grinding else 0.0)),
		"progressLabel": "Limpiando con varita 🪄" if cleaning else "Moliendo en el mortero 🥣...",
	})

func _end_match() -> void:
	if over:
		return
	over = true
	# diferido un frame: el main destruirá este nodo al recibir game_over (evita destruirlo dentro de _process)
	await get_tree().process_frame
	game_over.emit({"worldId": world["id"], "screenId": screen["id"], "score": score, "cans": cans})

# ------------------------------------------------------------------ sfx (procedural, como Fx.ts)

func sfx(name: String) -> void:
	var freqs := {"pickup": [520.0, 780.0], "drop": [300.0], "process": [200.0, 260.0], "bubble": [220.0],
		"ready": [660.0, 880.0, 1320.0], "deliver": [523.0, 659.0, 784.0, 1047.0], "fail": [220.0],
		"explode": [90.0], "clean": [400.0, 900.0]}
	if not freqs.has(name):
		return
	var sr := 22050
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_8_BITS
	stream.mix_rate = sr
	var data := PackedByteArray()
	var total := 0
	for f in freqs[name]:
		total += int(sr * 0.09)
	data.resize(total)
	var pos := 0
	for fi in freqs[name].size():
		var f: float = freqs[name][fi]
		var n := int(sr * 0.09)
		for i in n:
			var t := float(i) / sr
			var env := 1.0 - float(i) / float(n)
			var v := int(128 + 100 * env * sin(TAU * f * t))
			data[pos + i] = clampi(v, 0, 255)
		pos += n
	stream.data = data
	sfx_player.stream = stream
	sfx_player.volume_db = linear_to_db(Cfg.vol_sfx * 0.4)
	sfx_player.play()
