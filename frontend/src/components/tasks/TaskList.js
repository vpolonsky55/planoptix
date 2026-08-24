import React from 'react';
import TaskItem from './TaskItem';
import styles from './TaskList.module.css';

function TaskList({ 
    tasks, 
    expandedTasks, 
    onToggle, 
    onComplete, 
    onDelete, 
    onFocus,
    currentFocusedTaskId  // 👈 НОВЫЙ ПРОПС
}) {
    if (!tasks || tasks.length === 0) {
        return null;
    }

    return (
        <div className={styles.container}>
            {tasks.map(task => (
                <TaskItem
                    key={task.id}
                    task={task}
                    isExpanded={expandedTasks.has(task.id)}
                    expandedTasks={expandedTasks}
                    onToggle={onToggle}
                    onComplete={onComplete}
                    onDelete={onDelete}
                    onFocus={onFocus}
                    currentFocusedTaskId={currentFocusedTaskId}  // 👈 ПЕРЕДАЁМ
                />
            ))}
        </div>
    );
}

export default TaskList;