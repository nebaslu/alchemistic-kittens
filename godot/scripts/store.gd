extends Node
## Autoload Store: sesión y progreso persistentes en user:// (equivalente a src/game/progress.ts + localStorage).

var user := ""
var progress: Dictionary = {}  # screen_id -> {"bestCans": int, "medal": String}

const MEDAL_COLOR := {"bronze": Color("cd7f32"), "silver": Color("c0c0c0"), "gold": Color("ffd700")}
const MEDAL_LABEL := {"bronze": "bronce", "silver": "plata", "gold": "oro"}

func _ready() -> void:
	if FileAccess.file_exists("user://user.txt"):
		user = FileAccess.get_file_as_string("user://user.txt").strip_edges()
	load_progress()

func login(u: String) -> void:
	user = u
	var f := FileAccess.open("user://user.txt", FileAccess.WRITE)
	if f:
		f.store_string(u)
		f.close()
	load_progress()

func logout() -> void:
	user = ""
	progress = {}
	DirAccess.remove_absolute("user://user.txt")

func _progress_path() -> String:
	return "user://progress-%s.json" % user

func load_progress() -> void:
	progress = {}
	if FileAccess.file_exists(_progress_path()):
		var parsed = JSON.parse_string(FileAccess.get_file_as_string(_progress_path()))
		if parsed is Dictionary:
			progress = parsed

func medal_for(cans: int, thresholds: Dictionary) -> String:
	if cans >= int(thresholds.get("gold", 0)):
		return "gold"
	if cans >= int(thresholds.get("silver", 0)):
		return "silver"
	if cans >= int(thresholds.get("bronze", 0)):
		return "bronze"
	return ""

func record_result(screen_id: String, cans: int, medal: String) -> void:
	var cur: Dictionary = progress.get(screen_id, {})
	if cans > int(cur.get("bestCans", 0)):
		cur["bestCans"] = cans
	if medal != "":
		cur["medal"] = medal
	progress[screen_id] = cur
	var f := FileAccess.open(_progress_path(), FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify(progress))
		f.close()

## La siguiente pantalla se desbloquea con plata (o mejor) en la anterior.
func is_screen_unlocked(world: Dictionary, idx: int) -> bool:
	if idx <= 0:
		return true
	var prev: Dictionary = world["screens"][idx - 1]
	var p: Dictionary = progress.get(prev["id"], {})
	var th: Dictionary = Cfg.screen_medals(prev["id"])
	return int(p.get("bestCans", 0)) >= int(th.get("silver", 0))
