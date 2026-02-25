import py_compile
import sys
import json
from secure_core import engine

# Blueprint Requirement 4.2: Automated Fuzzing for Logic Integriy
# To be run in CI with: python src/lib/fuzz_logic.py

def test_fuzz_xp_updates():
    print("Starting XP Fuzzing...")
    # Simulate 10k random XP updates
    import random
    for _ in range(10000):
        prev_xp = engine.get_state()["xp"]
        amount = random.randint(-1000, 10000)
        state = engine.update_xp(amount, 1000000)
        
        # Invariant 1: XP should never decrease
        if amount > 0:
            assert state["xp"] >= prev_xp
        else:
            assert state["xp"] == prev_xp
            
        # Invariant 2: Level calculation must be consistent
        import math
        expected_level = int(math.sqrt(state["xp"] / 100)) + 1
        assert state["level"] == expected_level

def test_fuzz_dispatcher_types():
    print("Starting Dispatcher Type Injection Fuzzing...")
    # Inject wrong types for parameters
    actions = ["UPDATE_XP", "IDENTITY_SETUP", "HEARTBEAT"]
    bad_payloads = [
        {"amount": "not_an_int", "now": None},
        {"amount": [], "now": {}},
        {"amount": 100, "now": "string_time"},
        {"pub_key": 12345},
        ["list_instead_of_dict"],
        "string_instead_of_dict",
        None
    ]
    import random
    from secure_core import dispatch
    for _ in range(2000):
        action = random.choice(actions)
        payload = random.choice(bad_payloads)
        try:
            res = dispatch(json.dumps({"type": action, "payload": payload}))
            # Output should either be successful error JSON or safe state, never a raw crash
            parsed = json.loads(res)
            # If it's a list or not a dict, ensure it doesn't break JSON parsing
            assert isinstance(parsed, dict)
        except Exception as e:
            raise AssertionError(f"Dispatcher type injection crashed on action {action}: {e}")

def test_fuzz_time_travel():
    print("Starting Time Travel Fuzzing...")
    # Simulate erratic clock behavior
    from secure_core import engine
    import random
    
    # Reset engine to known good state
    engine._state["is_locked"] = False
    engine._state["monotonic_activity"] = 1000.0
    
    for _ in range(5000):
        action = random.choice(["UPDATE_XP", "HEARTBEAT"])
        # Generate erratic timestamps (going backwards, massive skips)
        erratic_now = random.choice([
            -9999999.0,         # Far past
            0.0,                # Epoch
            1005.0,             # Slightly ahead
            10000000.0,         # Massive skip
            float('inf'),       # Infinity (often crashes math)
            float('nan'),       # NaN 
        ])
        try:
            from secure_core import dispatch
            res_raw = dispatch(json.dumps({"type": action, "payload": {"amount": 10, "now": erratic_now}}))
            res = json.loads(res_raw)
            # Must not crash
            assert "error" not in res or isinstance(res["error"], str)
        except Exception as e:
             raise AssertionError(f"Time travel fuzzing crashed! {e}")

if __name__ == "__main__":
    try:
        test_fuzz_xp_updates()
        test_fuzz_dispatcher_types()
        test_fuzz_time_travel()
        print("✅ Fuzzing Tests Passed: Integrity Invariants Maintained.")
    except AssertionError as e:
        print(f"❌ Fuzzing Failure: Invariant Violated! {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ System Crash: {e}")
        sys.exit(1)
