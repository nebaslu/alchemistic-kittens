extends RefCounted
## Datos del juego (equivalente a src/game/data/*): ingredientes, recetas y rascador con 3 pantallas.

const INGREDIENT_IDS := ["catnip", "hairball", "meow3am", "fairyDust", "sirenTear", "scratcherRope"]

const INGREDIENTS := {
	"catnip": {"name": "Hierba gatera", "emoji": "🌿", "prep": "mortar"},
	"hairball": {"name": "Bola de pelos", "emoji": "🟤", "prep": "mortar"},
	"meow3am": {"name": "Maullido 3AM", "emoji": "😾", "prep": "mortar"},
	"fairyDust": {"name": "Polvo de hadas", "emoji": "✨", "prep": "mortar"},
	"sirenTear": {"name": "Lágrima de sirena", "emoji": "💧", "prep": "none"},
	"scratcherRope": {"name": "Cuerda de rascador mordida", "emoji": "🧶", "prep": "mortar"},
}

const RECIPES := {
	"ronroneo": {"id": "ronroneo", "name": "Poción de Ronroneo", "emoji": "🥛", "steps": ["catnip"], "basePoints": 10, "cookTime": 4, "burnTime": 999},
	"antiPelos": {"id": "antiPelos", "name": "Antídoto Anti-Pelos", "emoji": "🧴", "steps": ["hairball", "meow3am"], "basePoints": 20, "cookTime": 6, "burnTime": 30},
	"sirena": {"id": "sirena", "name": "Dulce Lágrima de Sirena", "emoji": "🧪", "steps": ["sirenTear", "fairyDust"], "basePoints": 25, "cookTime": 7, "burnTime": 28},
	"montes": {"id": "montes", "name": "Poción del Gato Montés", "emoji": "⚗️", "steps": ["catnip", "scratcherRope", "sirenTear"], "basePoints": 40, "cookTime": 9, "burnTime": 24},
}

static func ingredient_row() -> Array:
	var row: Array = []
	for i in INGREDIENT_IDS.size():
		row.append({"kind": "ingredient", "x": 90 + i * 130, "y": 150, "ingredient": INGREDIENT_IDS[i]})
	return row

static func worlds() -> Array:
	return [{
		"id": "torre",
		"name": "Rascador de la Torre del Mago",
		"emoji": "🗼",
		"screens": [
			{
				"id": "torre-s1", "name": "Pantalla 1 · Sótano de pociones", "maxActiveOrders": 1,
				"pool": [{"recipeId": "ronroneo", "timeLimit": 70}],
				"layout": ingredient_row() + [
					{"kind": "mortar", "x": 100, "y": 320, "label": "Almirez"},
					{"kind": "cauldron", "x": 480, "y": 350},
					{"kind": "counter", "x": 850, "y": 320, "label": "ENTREGA"},
					{"kind": "wandRack", "x": 850, "y": 490, "label": "Varita"},
				],
			},
			{
				"id": "torre-s2", "name": "Pantalla 2 · Sala del caldero", "maxActiveOrders": 2,
				"pool": [
					{"recipeId": "ronroneo", "timeLimit": 80},
					{"recipeId": "antiPelos", "timeLimit": 95},
					{"recipeId": "sirena", "timeLimit": 95},
				],
				"layout": ingredient_row() + [
					{"kind": "mortar", "x": 110, "y": 300, "label": "Almirez"},
					{"kind": "cauldron", "x": 500, "y": 370},
					{"kind": "counter", "x": 860, "y": 300, "label": "ENTREGA"},
					{"kind": "wandRack", "x": 860, "y": 500, "label": "Varita"},
				],
			},
			{
				"id": "torre-s3", "name": "Pantalla 3 · Ático del mago", "maxActiveOrders": 3,
				"pool": [
					{"recipeId": "antiPelos", "timeLimit": 85},
					{"recipeId": "sirena", "timeLimit": 85},
					{"recipeId": "montes", "timeLimit": 100},
					{"recipeId": "ronroneo", "timeLimit": 70},
				],
				"layout": ingredient_row() + [
					{"kind": "mortar", "x": 120, "y": 310, "label": "Almirez"},
					{"kind": "cauldron", "x": 470, "y": 360},
					{"kind": "counter", "x": 850, "y": 310, "label": "ENTREGA"},
					{"kind": "wandRack", "x": 850, "y": 510, "label": "Varita"},
				],
			},
		],
	}]
