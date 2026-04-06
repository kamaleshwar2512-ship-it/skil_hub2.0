import urllib.request
import json

BASE_URL = "http://127.0.0.1:5000"

def run_test(name, payload):
    print(f"\n--- Testing: {name} ---")
    req = urllib.request.Request(
        f"{BASE_URL}/recommend-projects", 
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            data = json.loads(response.read().decode('utf-8'))
            print(f"Status: {status}")
            print(json.dumps(data, indent=2))
            return data
    except urllib.error.HTTPError as e:
        print(f"Failed HTTP: {e.code}")
        print(e.read().decode('utf-8'))
    except Exception as e:
        print(f"Failed: {e}")
        return None

# Case 1: Exact Match Priority
case1_payload = {
    "student_skills": ["python", "machine learning"],
    "projects": [
        {"project_id": 1, "required_skills": ["python", "machine learning"]}
    ]
}

# Case 2: Synonym Handling
case2_payload = {
    "student_skills": ["ml", "js"],
    "projects": [
        {"project_id": 1, "required_skills": ["machine learning", "javascript"]}
    ]
}

# Case 3: Partial Match
case3_payload = {
    "student_skills": ["python"],
    "projects": [
        {"project_id": 1, "required_skills": ["python", "machine learning"]}
    ]
}

# Case 4: No Match
case4_payload = {
    "student_skills": ["ui design"],
    "projects": [
        {"project_id": 1, "required_skills": ["backend", "node.js"]}
    ]
}

# Case 5: Ranking Validation
case5_payload = {
    "student_skills": ["python", "machine learning"],
    "projects": [
        {"project_id": 1, "required_skills": ["backend", "node.js"]},         # Irrelevant
        {"project_id": 2, "required_skills": ["python", "machine learning"]}, # Exact
        {"project_id": 3, "required_skills": ["python", "django"]}            # Partial
    ]
}

# Case 6: Edge Case - Empty skills
case6_payload = {
    "student_skills": [],
    "projects": [
        {"project_id": 1, "required_skills": ["python"]}
    ]
}

# Case 7: Edge Case - Missing skills
case7_payload = {
    "student_skills": ["python"],
    "projects": []
}

if __name__ == "__main__":
    run_test("Case 1 - Exact Match", case1_payload)
    run_test("Case 2 - Synonym Handling", case2_payload)
    run_test("Case 3 - Partial Match", case3_payload)
    run_test("Case 4 - No Match", case4_payload)
    run_test("Case 5 - Ranking Validation", case5_payload)
    run_test("Case 6 - Edge Case Empty User", case6_payload)
    run_test("Case 7 - Edge Case Empty Projects", case7_payload)
