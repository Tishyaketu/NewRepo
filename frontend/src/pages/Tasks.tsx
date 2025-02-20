import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Tasks.css"; // ✅ Import styles
import Header from "../components/Header";

interface Task {
  taskNumber: number;
  title: string;
  description?: string;
  isComplete: boolean;
  userId: number;
}

interface TasksProps {
  setAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

const Tasks: React.FC<TasksProps> = ({ setAuth }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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

  const logout = () => {
    localStorage.removeItem("token");
    setAuth(false);
    navigate("/login");
  };

  const createTask = async () => {
    if (!title.trim()) {
      alert("Task title cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/tasks",
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks([...tasks, response.data]);
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Error creating task", error);
    }
  };

  const deleteTask = async (taskNumber: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

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

  const toggleComplete = async (taskNumber: number, isChecked: boolean) => {
    try {
      await axios.put(
        `http://localhost:5000/tasks/${taskNumber}`,
        { isComplete: isChecked },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks(tasks.map((task) =>
        task.taskNumber === taskNumber ? { ...task, isComplete: isChecked } : task
      ));
    } catch (error) {
      console.error("Error marking task complete", error);
    }
  };

  return (
    <>
      <Header />
      <div className="tasks-container">
        <button className="logout-button" onClick={logout}>Logout</button>
        <h2>Tasks</h2>

        {/* Add Task Button */}
        <button className="add-task-button" onClick={() => setIsModalOpen(true)}>Add Task</button>

        {/* Task Creation Modal */}
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h3>Create a New Task</h3>
              <input type="text" placeholder="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <div className="modal-buttons">
                <button className="save-button" onClick={createTask}>Save</button>
                <button className="cancel-button" onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <table className="task-table">
          <thead>
            <tr>
              <th>Task ID</th>
              <th>Task Title</th>
              <th>Description</th>
              <th>Completed</th>
              <th>Actions</th>
              <th>User ID</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.taskNumber}>
                <td>{task.taskNumber}</td>
                <td>
                  {editingTask && editingTask.taskNumber === task.taskNumber ? (
                    <input
                      type="text"
                      value={editingTask.title}
                      onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    />
                  ) : (
                    task.title
                  )}
                </td>
                <td>
                  {editingTask && editingTask.taskNumber === task.taskNumber ? (
                    <input
                      type="text"
                      value={editingTask.description || ""}
                      onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    />
                  ) : (
                    task.description || "-"
                  )}
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={task.isComplete}
                    onChange={(e) => toggleComplete(task.taskNumber, e.target.checked)}
                  />
                </td>
                <td className="task-actions">
                  {editingTask && editingTask.taskNumber === task.taskNumber ? (
                    <>
                      <button className="save-button" onClick={updateTask}>Save</button>
                      <button className="cancel-button" onClick={() => setEditingTask(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="edit-button" onClick={() => setEditingTask(task)}>Edit</button>
                      <button className="delete-button" onClick={() => deleteTask(task.taskNumber)}>Delete</button>
                    </>
                  )}
                </td>
                <td>{task.userId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Tasks;
