import React from 'react';

function DashboardControls({
    sortType,
    setSortType,
    onExpandAll,
    onCollapseAll,
    onLogout,
}) {
    return (
        <div style={styles.container}>
            <div style={styles.controls}>
                <div style={styles.expandButtons}>
                    <button onClick={onExpandAll} style={styles.expandControlButton} title="Развернуть все">
                        📂 Развернуть все
                    </button>
                    <button onClick={onCollapseAll} style={styles.expandControlButton} title="Свернуть все">
                        📁 Свернуть все
                    </button>
                </div>
                <div style={styles.sortButtons}>
                    <button
                        onClick={() => setSortType('newest')}
                        style={{
                            ...styles.sortButton,
                            backgroundColor: sortType === 'newest' ? '#007bff' : '#e9ecef',
                            color: sortType === 'newest' ? 'white' : '#333',
                        }}
                        title="Сначала новые"
                    >
                        📅 Новые
                    </button>
                    <button
                        onClick={() => setSortType('oldest')}
                        style={{
                            ...styles.sortButton,
                            backgroundColor: sortType === 'oldest' ? '#007bff' : '#e9ecef',
                            color: sortType === 'oldest' ? 'white' : '#333',
                        }}
                        title="Сначала старые"
                    >
                        📅 Старые
                    </button>
                    <button
                        onClick={() => setSortType('alphabet')}
                        style={{
                            ...styles.sortButton,
                            backgroundColor: sortType === 'alphabet' ? '#007bff' : '#e9ecef',
                            color: sortType === 'alphabet' ? 'white' : '#333',
                        }}
                        title="По алфавиту"
                    >
                        🔤 А-Я
                    </button>
                </div>
                <button onClick={onLogout} style={styles.logoutButton}>
                    Выйти
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    expandButtons: {
        display: 'flex',
        gap: '0.25rem',
    },
    expandControlButton: {
        padding: '0.35rem 0.7rem',
        backgroundColor: '#e9ecef',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.75rem',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
    },
    sortButtons: {
        display: 'flex',
        gap: '0.25rem',
    },
    sortButton: {
        padding: '0.4rem 0.75rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        transition: 'all 0.2s',
    },
    logoutButton: {
        padding: '0.4rem 0.75rem',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85rem',
    },
};

export default DashboardControls;