import React from 'react';
import { useNavigate } from 'react-router-dom';

function TaskItem({ task, level = 0, isExpanded, onToggle, onComplete, onDelete }) {
    const navigate = useNavigate();
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

    return (
        <div style={{ marginLeft: `${level * 20}px`, marginBottom: '8px' }}>
            <div style={styles.taskItem}>
                <div style={styles.taskContent}>
                    {/* Кнопка разворачивания/сворачивания */}
                    {hasSubtasks && (
                        <button
                            onClick={() => onToggle(task.id)}
                            style={styles.expandButton}
                            title={isExpanded ? 'Свернуть подзадачи' : 'Развернуть подзадачи'}
                        >
                            {isExpanded ? '▼' : '▶'}
                        </button>
                    )}
                    {!hasSubtasks && <span style={styles.expandPlaceholder} />}

                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onComplete(task.id)}
                        style={styles.checkbox}
                    />
                    <div style={styles.taskInfo}>
                        <span style={{
                            ...styles.taskTitle,
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? '#888' : '#333'
                        }}>
                            {task.title}
                        </span>
                        {task.tags_detail && task.tags_detail.length > 0 && (
                            <div style={styles.tagsContainer}>
                                {task.tags_detail.map(tag => (
                                    <span
                                        key={tag.id}
                                        style={{
                                            ...styles.tag,
                                            backgroundColor: tag.color + '20',
                                            borderLeft: `3px solid ${tag.color}`,
                                        }}
                                    >
                                        🏷️ {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                        {task.assigned_people_detail && task.assigned_people_detail.length > 0 && (
                            <div style={styles.peopleTags}>
                                {task.assigned_people_detail.map(person => (
                                    <span key={person.id} style={styles.personTag}>
                                        👤 {person.first_name} {person.last_name || ''}
                                    </span>
                                ))}
                            </div>
                        )}
                        {task.place_detail && (
                            <div style={styles.placeInfo}>
                                📍 {task.place_detail.name}
                                {task.place_detail.address && <span> ({task.place_detail.address})</span>}
                            </div>
                        )}
                        {task.resources_detail && task.resources_detail.length > 0 && (
                            <div style={styles.resourcesContainer}>
                                {task.resources_detail.map(resource => (
                                    <span key={resource.id} style={styles.resourceTag}>
                                        {resource.resource_type === 'link' ? '🔗' : '📄'} {resource.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    {task.scheduled_end && (
                        <span style={styles.deadline}>
                            📅 {new Date(task.scheduled_end).toLocaleDateString()}
                        </span>
                    )}
                </div>
                <div style={styles.actions}>
                    <button
                        onClick={() => navigate(`/tasks/edit/${task.id}`)}
                        style={styles.editButton}
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        style={styles.deleteButton}
                    >
                        🗑️
                    </button>
                </div>
            </div>
            {hasSubtasks && isExpanded && (
                <div style={styles.subtasksContainer}>
                    {task.subtasks.map(subtask => (
                        <TaskItem
                            key={subtask.id}
                            task={subtask}
                            level={level + 1}
                            isExpanded={isExpanded}
                            onToggle={onToggle}
                            onComplete={onComplete}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    taskItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        border: '1px solid #eee',
    },
    taskContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flex: 1,
    },
    checkbox: {
        width: '20px',
        height: '20px',
        cursor: 'pointer',
    },
    taskTitle: {
        flex: 1,
    },
    deadline: {
        fontSize: '0.85rem',
        color: '#888',
    },
    expandButton: {
        padding: '0.2rem 0.4rem',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        color: '#666',
        transition: 'all 0.2s',
        width: '24px',
        textAlign: 'center',
    },
    expandPlaceholder: {
        width: '24px',
        display: 'inline-block',
    },
    subtasksContainer: {
        marginLeft: '10px',
        borderLeft: '2px solid #e0e0e0',
        paddingLeft: '10px',
    },
    actions: {
        display: 'flex',
        gap: '0.5rem',
    },
    editButton: {
        padding: '0.25rem 0.5rem',
        backgroundColor: '#e3f2fd',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1.2rem',
    },
    deleteButton: {
        padding: '0.25rem 0.5rem',
        backgroundColor: '#ffebee',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1.2rem',
    },
    taskInfo: {
        flex: 1,
    },
    tagsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '0.5rem',
    },
    tag: {
        fontSize: '0.7rem',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        color: '#495057',
    },
    peopleTags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '0.5rem',
    },
    personTag: {
        fontSize: '0.75rem',
        padding: '0.2rem 0.5rem',
        backgroundColor: '#e9ecef',
        borderRadius: '4px',
        color: '#495057',
    },
    placeInfo: {
        fontSize: '0.75rem',
        color: '#666',
        marginTop: '0.25rem',
    },
    resourcesContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '0.5rem',
    },
    resourceTag: {
        fontSize: '0.7rem',
        padding: '0.2rem 0.5rem',
        backgroundColor: '#e8eaf6',
        borderRadius: '4px',
        color: '#3f51b5',
    },
};

export default TaskItem;