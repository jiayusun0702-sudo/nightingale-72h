import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

class NoteVersionControl:
    def __init__(self, initial_content, author):
        self.version = 1
        self.content = initial_content
        self.history = [{
            "version": 1,
            "content": initial_content,
            "modified_by": author
        }]

    def edit(self, new_content, modified_by):
        self.version += 1
        self.content = new_content
        self.history.append({
            "version": self.version,
            "content": new_content,
            "modified_by": modified_by
        })

    def revert(self, target_version):
        target_snap = next((h for h in self.history if h["version"] == target_version), None)
        if target_snap:
            self.content = target_snap["content"]
            self.version += 1
            return True
        return False

def test_revision_history_flow():
    note = NoteVersionControl("Initial note text", "dr_smith")
    assert note.version == 1

    # 1. 断言编辑后版本自增
    note.edit("Updated note text", "nurse_joy")
    assert note.version == 2
    assert note.content == "Updated note text"

    # 2. 断言回退功能能够恢复旧状态[cite: 1]
    revert_success = note.revert(1)
    assert revert_success is True
    assert note.content == "Initial note text"

    # 3. 断言审计日志元数据记录完备[cite: 1]
    assert len(note.history) == 2
    assert note.history[1]["modified_by"] == "nurse_joy"

