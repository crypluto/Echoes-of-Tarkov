import os
import json
from pathlib import Path
from bson import ObjectId  # Real MongoDB ObjectId

# 📂 Fixed input folder path
INPUT_FOLDER = Path(r"N:\SPT 3.11\user\mods\Echoes-of-Tarkov---Requisitions\db\items")
OUTPUT_FILE = INPUT_FOLDER.parent / "generated_assorts.json"

def load_json_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json_file(data, output_path):
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

def find_custom_items(json_data):
    """Return dictionary of custom items (must have 'itemTplToClone')"""
    if not isinstance(json_data, dict):
        return {}
    return {
        key: val for key, val in json_data.items()
        if isinstance(val, dict) and "itemTplToClone" in val
    }

def create_assort_entry(item_id, count=9999999, barter_tpl="5696686a4bdc2da3298b456a", barter_count=1, loyalty=1):
    entry_id = str(ObjectId())  # Real MongoDB ObjectId
    return {
        "items": [
            {
                "_id": entry_id,
                "_tpl": item_id,
                "parentId": "hideout",
                "slotId": "hideout",
                "upd": {
                    "UnlimitedCount": False,
                    "StackObjectsCount": count
                }
            }
        ],
        "barter_scheme": {
            entry_id: [
                [
                    {
                        "_tpl": barter_tpl,
                        "count": barter_count
                    }
                ]
            ]
        },
        "loyal_level_items": {
            entry_id: loyalty
        }
    }

def generate_assorts_from_folder(folder_path, output_path):
    assort_output = {
        "items": [],
        "barter_scheme": {},
        "loyal_level_items": {}
    }

    for file in os.listdir(folder_path):
        if file.endswith(".json"):
            path = folder_path / file
            try:
                data = load_json_file(path)
                items = find_custom_items(data)
                for item_id in items:
                    new_assort = create_assort_entry(item_id)
                    assort_output["items"].extend(new_assort["items"])
                    assort_output["barter_scheme"].update(new_assort["barter_scheme"])
                    assort_output["loyal_level_items"].update(new_assort["loyal_level_items"])
                    print(f"✅ Generated assort for {item_id}")
            except Exception as e:
                print(f"⚠️ Failed to parse {file}: {e}")

    save_json_file(assort_output, output_path)
    print(f"\n🎉 Done! Assorts saved to: {output_path}")

# 🔧 Run the script
if __name__ == "__main__":
    generate_assorts_from_folder(INPUT_FOLDER, OUTPUT_FILE)
