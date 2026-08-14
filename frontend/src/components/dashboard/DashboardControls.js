import React from 'react';
import styles from './DashboardControls.module.css';  // 👈 Импорт CSS-модуля

function DashboardControls({
    sortType,
    setSortType,
    onExpandAll,
    onCollapseAll,
    onLogout,
}) {
    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <div className={styles.expandButtons}>
                    <button onClick={onExpandAll} className={styles.expandControlButton} title="Развернуть все">
                        📂 Развернуть все
                    </button>
                    <button onClick={onCollapseAll} className={styles.expandControlButton} title="Свернуть все">
                        📁 Свернуть все
                    </button>
                </div>
                <div className={styles.sortButtons}>
                    <button
                        onClick={() => setSortType('newest')}
                        className={styles.sortButton}
                        style={{
                            backgroundColor: sortType === 'newest' ? '#007bff' : '#e9ecef',
                            color: sortType === 'newest' ? 'white' : '#333',
                        }}
                        title="Сначала новые"
                    >
                        📅 Новые
                    </button>
                    <button
                        onClick={() => setSortType('oldest')}
                        className={styles.sortButton}
                        style={{
                            backgroundColor: sortType === 'oldest' ? '#007bff' : '#e9ecef',
                            color: sortType === 'oldest' ? 'white' : '#333',
                        }}
                        title="Сначала старые"
                    >
                        📅 Старые
                    </button>
                    <button
                        onClick={() => setSortType('alphabet')}
                        className={styles.sortButton}
                        style={{
                            backgroundColor: sortType === 'alphabet' ? '#007bff' : '#e9ecef',
                            color: sortType === 'alphabet' ? 'white' : '#333',
                        }}
                        title="По алфавиту"
                    >
                        🔤 А-Я
                    </button>
                </div>
                <button onClick={onLogout} className={styles.logoutButton}>
                    Выйти
                </button>
            </div>
        </div>
    );
}

export default DashboardControls;