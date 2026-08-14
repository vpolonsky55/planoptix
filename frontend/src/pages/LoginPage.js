import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';  // 👈 Импорт CSS-модуля

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const { login, error, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        
        const result = await login(username, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setLocalError(result.error || 'Ошибка входа');
        }
    };

    if (loading) {
        return <div className={styles.loading}>Загрузка...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Planoptix</h1>
                <h2 className={styles.subtitle}>Вход в систему</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Имя пользователя</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    
                    {(localError || error) && (
                        <div className={styles.error}>
                            {localError || error}
                        </div>
                    )}
                    
                    <button type="submit" className={styles.button}>
                        Войти
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;