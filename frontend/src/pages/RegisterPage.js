import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styles from './RegisterPage.module.css';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [localError, setLocalError] = useState('');
    const { register, error, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (password !== password2) {
            setLocalError('Пароли не совпадают');
            return;
        }

        const result = await register(username, email, password, password2);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setLocalError(result.error || 'Ошибка регистрации');
        }
    };

    if (loading) {
        return <div className={styles.loading}>Загрузка...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Planoptix</h1>
                <h2 className={styles.subtitle}>Регистрация</h2>

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
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            minLength={8}
                        />
                        <small className={styles.hint}>
                            Минимум 8 символов, не должен быть слишком распространённым
                        </small>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Повторите пароль</label>
                        <input
                            type="password"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
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
                        Зарегистрироваться
                    </button>
                </form>

                <p className={styles.footer}>
                    Уже есть аккаунт? <Link to="/login" className={styles.link}>Войти</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;