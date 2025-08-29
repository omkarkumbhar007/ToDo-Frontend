"use client";

import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import useSWR from "swr";
import styles from "./page.module.css";

const API_BASE = "https://todo-backend-tl8e.onrender.com/api/todos";

const fetcher = async (url) => {
  const res = await axios.get(url);
  return res.data;
};

function PencilIcon({ className }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
        fill="currentColor"
      />
      <path
        d="M20.71 7.04a1 1 0 000-1.41L18.37 3.29a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
        fill="currentColor"
      />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M9 3h6l1 2h4v2H4V5h4l1-2z" fill="currentColor" />
      <path
        d="M6 9h12l-1 11a2 2 0 01-2 2H9a2 2 0 01-2-2L6 9z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Home() {
  const [task, setTask] = useState("");
  const [selected, setSelected] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const { data, isLoading, error, mutate } = useSWR(API_BASE, fetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    setInterval(() => {
      fetcher();
    }, 300);
  }, []);

  const todos = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const addTask = async () => {
    const value = task.trim();
    if (!value) return;
    try {
      await axios.post(API_BASE, { todo: value });
      setTask("");
      mutate();
    } catch (err) {
      alert("Failed to add task. Please try again.");
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      mutate();
    } catch (err) {
      alert("Failed to delete task. Please try again.");
    }
  };

  const startEdit = (t) => {
    setEditId(t.id);
    setEditText(t.todo || "");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditText("");
  };

  const saveEdit = async (id) => {
    const value = editText.trim();
    if (!value) return;
    try {
      await axios.put(`${API_BASE}/${id}`, { todo: value });
      setEditId(null);
      setEditText("");
      mutate();
    } catch (err) {
      alert("Failed to update task. Please try again.");
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className="sr-only"></span> To‑Do List
        </h1>
      </header>

      <div className={styles.inputRow}>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Add a new task..."
          className={styles.input}
          aria-label="New task"
        />
        <button
          onClick={addTask}
          className={styles.addBtn}
          aria-label="Add task"
        >
          Add
        </button>
      </div>

      {isLoading && <p className={styles.loadingText}>Loading tasks…</p>}
      {error && (
        <p className={styles.errorText}>
          Failed to load tasks. Please refresh.
        </p>
      )}

      {!isLoading && !error && (
        <ul className={styles.taskList} aria-label="Tasks">
          {todos.map((t) => {
            const isEditing = editId === t.id;
            return (
              <li key={t.id} className={styles.taskItem}>
                <div className={styles.taskLeft}>
                  {isEditing ? (
                    <input
                      className={styles.editInput}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      aria-label="Edit task"
                      placeholder="Update task..."
                      autoFocus
                    />
                  ) : (
                    <span className={styles.todoText}>{t.todo}</span>
                  )}
                </div>

                <div
                  className={styles.actions}
                  role="group"
                  aria-label={`Actions for task ${t.id}`}
                >
                  {!isEditing ? (
                    <>
                      <button
                        className={styles.viewBtn}
                        onClick={() => setSelected(t)}
                        aria-label="View task details"
                        title="View Task"
                      >
                        View
                      </button>
                      <button
                        className={styles.iconBtn}
                        onClick={() => startEdit(t)}
                        aria-label="Edit task"
                        title="Edit Task"
                      >
                        <PencilIcon className={styles.icon} />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.delete}`}
                        onClick={() => deleteTask(t.id)}
                        aria-label="Delete task"
                        title="Delete Task"
                      >
                        <TrashIcon className={styles.icon} />
                        <span className="sr-only">Delete</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className={styles.saveBtn}
                        onClick={() => saveEdit(t.id)}
                        aria-label="Save task"
                        title="Save"
                      >
                        Save
                      </button>
                      <button
                        className={styles.cancelBtn}
                        onClick={cancelEdit}
                        aria-label="Cancel edit"
                        title="Cancel"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
          {todos.length === 0 && (
            <li className={styles.emptyState}>
              No tasks yet. Add your first task above.
            </li>
          )}
        </ul>
      )}

      {selected && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-details-title"
          onClick={() => setSelected(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 id="task-details-title" className={styles.modalTitle}>
                Task Details
              </h2>
              <button
                className={styles.iconBtn}
                aria-label="Close"
                onClick={() => setSelected(null)}
                title="Close"
              >
                Close
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Todo</span>
                <span className={styles.detailValue}>{selected.todo}</span>
              </div>
              {selected.status && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status</span>
                  <span className={styles.detailValue}>{selected.status}</span>
                </div>
              )}
              {selected.priority && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Priority</span>
                  <span className={styles.detailValue}>
                    {selected.priority}
                  </span>
                </div>
              )}
              {selected.category && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Category</span>
                  <span className={styles.detailValue}>
                    {selected.category}
                  </span>
                </div>
              )}
              {selected.due_date && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Due Date</span>
                  <span className={styles.detailValue}>
                    {selected.due_date}
                  </span>
                </div>
              )}
              {selected.notes && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Notes</span>
                  <span className={styles.detailValue}>{selected.notes}</span>
                </div>
              )}
              {selected.created_at && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Created</span>
                  <span className={styles.detailValue}>
                    {selected.created_at}
                  </span>
                </div>
              )}
              {selected.updated_at && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Updated</span>
                  <span className={styles.detailValue}>
                    {selected.updated_at}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.addBtn}
                onClick={() => setSelected(null)}
                aria-label="Close details"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
