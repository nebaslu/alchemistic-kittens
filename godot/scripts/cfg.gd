extends Node
## Autoload Cfg: carga la config en runtime (user://game.config.json si existe; si no, res://config/game.config.json).
## Equivalente a src/game/config.ts: editable sin recompilar copiando el JSON a user:// (o editando res:// en el editor).

var config: Dictionary = {}
var vol_music := 0.7
var vol_sfx := 0.8

func _ready() -> void:
	config = {
		"match": {"durationSeconds": 180, "tipMultiplier": 1.5},
		"player": {"speed": 235},
		"interaction": {"distance": 92, "processSeconds": 1.0, "cleanSeconds": 1.5},
		"cauldron": {"readyExplodeSeconds": 10},
		"audio": {"musicVolume": 0.7, "sfxVolume": 0.8},
		"screens": {},
		"medals": {
			"torre-s1": {"bronze": 150, "silver": 300, "gold": 500},
			"torre-s2": {"bronze": 200, "silver": 400, "gold": 650},
			"torre-s3": {"bronze": 120, "silver": 250, "gold": 400},
		},
	}
	var path := "user://game.config.json"
	if not FileAccess.file_exists(path):
		path = "res://config/game.config.json"
	if FileAccess.file_exists(path):
		var f := FileAccess.open(path, FileAccess.READ)
		if f:
			var parsed = JSON.parse_string(f.get_as_text())
			if parsed is Dictionary:
				config = _merge(config, parsed)
			f.close()
	var vols := {}
	if FileAccess.file_exists("user://vol.json"):
		var parsed = JSON.parse_string(FileAccess.get_file_as_string("user://vol.json"))
		if parsed is Dictionary:
			vols = parsed
	vol_music = float(vols.get("music", config["audio"]["musicVolume"]))
	vol_sfx = float(vols.get("sfx", config["audio"]["sfxVolume"]))

func _merge(a: Dictionary, b: Dictionary) -> Dictionary:
	var out := a.duplicate(true)
	for k in b:
		if out.has(k) and out[k] is Dictionary and b[k] is Dictionary:
			out[k] = _merge(out[k], b[k])
		else:
			out[k] = b[k]
	return out

func screen_duration(screen_id: String) -> float:
	var s: Dictionary = config.get("screens", {})
	if s.has(screen_id) and s[screen_id] is Dictionary and s[screen_id].has("durationSeconds"):
		return float(s[screen_id]["durationSeconds"])
	return float(config["match"]["durationSeconds"])

func screen_medals(screen_id: String) -> Dictionary:
	return config.get("medals", {}).get(screen_id, {"bronze": 0, "silver": 0, "gold": 0})

func tip_multiplier() -> float:
	return float(config["match"]["tipMultiplier"])

func set_volumes(music: float, sfx: float) -> void:
	vol_music = music
	vol_sfx = sfx
	var f := FileAccess.open("user://vol.json", FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify({"music": music, "sfx": sfx}))
		f.close()
