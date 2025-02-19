import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Task {
  taskNumber: number;
  title: string;
  description?: string;
  isComplete: boolean;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    if (!token) navigate("/login");

    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks", error);
      }
    };

    fetchTasks();
  }, [token, navigate]);

  const createTask = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/tasks",
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([...tasks, response.data]);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Error creating task", error);
    }
  };

  const deleteTask = async (taskNumber: number) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${taskNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task.taskNumber !== taskNumber));
    } catch (error) {
      console.error("Error deleting task", error);
    }
  };

  const updateTask = async () => {
    if (!editingTask) return;

    try {
      await axios.put(
        `http://localhost:5000/tasks/${editingTask.taskNumber}`,
        { title: editingTask.title, description: editingTask.description, isComplete: editingTask.isComplete },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks(
        tasks.map((task) =>
          task.taskNumber === editingTask.taskNumber ? { ...task, title: editingTask.title, description: editingTask.description } : task
        )
      );
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task", error);
    }
  };

  const markComplete = async (taskNumber: number) => {
    try {
      await axios.put(
        `http://localhost:5000/tasks/${taskNumber}`,
        { isComplete: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks(tasks.map((task) =>
        task.taskNumber === taskNumber ? { ...task, isComplete: true } : task
      ));
    } catch (error) {
      console.error("Error marking task complete", error);
    }
  };

  return (
    <div>
      <h2>Tasks</h2>
      {/* Task Creation Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createTask();
        }}
      >
        <button onClick={logout}>Logout</button>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit">Add Task</button>
      </form>

      {/* Task List */}
      <ul>
        {tasks.map((task) => (
          <li key={task.taskNumber}>
            {editingTask && editingTask.taskNumber === task.taskNumber ? (
              <div>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
                <input
                  type="text"
                  value={editingTask.description || ""}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />
                <button onClick={updateTask}>Save</button>
                <button onClick={() => setEditingTask(null)}>Cancel</button>
              </div>
            ) : (
              <div>
                <span>{task.title} - {task.isComplete ? "✅ Completed" : "❌ Not Completed"}</span>
                <button onClick={() => deleteTask(task.taskNumber)}>Delete</button>
                <button onClick={() => setEditingTask(task)}>Edit</button>
                {!task.isComplete && <button onClick={() => markComplete(task.taskNumber)}>Mark Complete</button>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
