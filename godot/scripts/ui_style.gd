extends RefCounted
## Estilos de los 3 temas (A=Kenney, B=Lumo, C=Gemini) aplicados a botones/paneles/labels en código.

const THEMES := {
	"a": {"name": "Kenney", "btn_bg": Color("8a5a2b"), "btn_fg": Color.BLACK, "sec_bg": Color("9a9a9a"), "sec_fg": Color("2a1f14"),
		"panel_bg": Color("2a1c10cc"), "text": Color("e8e2f5"), "panel_text": Color("f4ebd9"), "gold": Color("ffd75e"), "radius": 0, "font_size": 18},
	"b": {"name": "Lumo", "btn_bg": Color("6d4aff"), "btn_fg": Color.WHITE, "sec_bg": Color("573b58"), "sec_fg": Color("f4ebd9"),
		"panel_bg": Color("fff8ec"), "text": Color("f4ebd9"), "panel_text": Color("1c1430"), "gold": Color("ffb74d"), "radius": 12, "font_size": 18},
	"c": {"name": "Gemini", "btn_bg": Color("2e7d32"), "btn_fg": Color.WHITE, "sec_bg": Color("5c435d"), "sec_fg": Color("f4ebd9"),
		"panel_bg": Color("3d293e"), "text": Color("f4ebd9"), "panel_text": Color("f4ebd9"), "gold": Color("ffd700"), "radius": 0, "font_size": 13},
}
const THEME_ORDER := ["a", "b", "c"]

static func next_theme(id: String) -> String:
	var i := THEME_ORDER.find(id)
	return THEME_ORDER[(i + 1) % THEME_ORDER.size()]

static func style_button(btn: Button, theme_id: String, variant := "normal") -> void:
	var t: Dictionary = THEMES[theme_id]
	var bg: Color = t["btn_bg"]
	var fg: Color = t["btn_fg"]
	if variant == "secondary":
		bg = t["sec_bg"]
		fg = t["sec_fg"]
	elif variant == "danger":
		bg = Color("b03024")
		fg = Color.WHITE
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.set_corner_radius_all(int(t["radius"]))
	if theme_id == "c":
		sb.set_border_width_all(4)
		sb.border_color = Color("231724")
		sb.shadow_size = 4
		sb.shadow_color = Color(0, 0, 0, 0.4)
	sb.content_margin_left = 20
	sb.content_margin_right = 20
	sb.content_margin_top = 10
	sb.content_margin_bottom = 10
	btn.add_theme_stylebox_override("normal", sb)
	var sbh := sb.duplicate()
	sbh.bg_color = bg.lightened(0.15)
	btn.add_theme_stylebox_override("hover", sbh)
	var sbp := sb.duplicate()
	sbp.bg_color = bg.darkened(0.15)
	btn.add_theme_stylebox_override("pressed", sbp)
	var sbd := sb.duplicate()
	sbd.bg_color = bg.darkened(0.3)
	btn.add_theme_stylebox_override("disabled", sbd)
	for st in ["font_color", "font_hover_color", "font_pressed_color", "font_disabled_color"]:
		btn.add_theme_color_override(st, fg)
	btn.add_theme_font_size_override("font_size", int(t["font_size"]))
	btn.custom_minimum_size = Vector2(0, 48)

static func style_panel(panel: PanelContainer, theme_id: String) -> void:
	var t: Dictionary = THEMES[theme_id]
	var sb := StyleBoxFlat.new()
	sb.bg_color = t["panel_bg"]
	sb.set_corner_radius_all(int(t["radius"]))
	if theme_id == "c":
		sb.set_border_width_all(4)
		sb.border_color = Color("231724")
	sb.content_margin_left = 16
	sb.content_margin_right = 16
	sb.content_margin_top = 12
	sb.content_margin_bottom = 12
	panel.add_theme_stylebox_override("panel", sb)

static func style_label(label: Label, theme_id: String, on_panel := false) -> void:
	var t: Dictionary = THEMES[theme_id]
	label.add_theme_color_override("font_color", t["panel_text"] if on_panel else t["text"])
