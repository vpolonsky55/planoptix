import React from 'react';
import TaskItem from './TaskItem';

// 👇 ИЗМЕНЕНО: добавлен onFocus в пропсы
function TaskList({ tasks, expandedTasks, onToggle, onComplete, onDelete, onFocus }) {
    if (!tasks || tasks.length === 0) {
        return null;
    }

    return (
        <div style={styles.container}>
            {tasks.map(task => (
                <TaskItem
                    key={task.id}
                    task={task}
                    isExpanded={expandedTasks.has(task.id)}
                    onToggle={onToggle}
                    onComplete={onComplete}
                    onDelete={onDelete}
                    onFocus={onFocus}  // 👈 НОВОЕ: передаём onFocus
                />
            ))}
        </div>
    );
}

const styles = {
    container: {
        marginTop: '1rem',
    },
};

export default TaskList;