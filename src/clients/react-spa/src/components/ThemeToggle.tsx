// ---- File: src/components/ThemeToggle.tsx ----
import { useSelector, useDispatch } from 'react-redux';
import { FaSun, FaMoon } from 'react-icons/fa';
import type { RootState, AppDispatch } from '../store/store';
import { toggleTheme } from '../store/themeSlice';

const ThemeToggle = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { mode } = useSelector((state: RootState) => state.theme);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
      title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
    >
      {mode === 'light' ? <FaMoon size="1.2em" /> : <FaSun size="1.2em" />}
    </button>
  );
};

export default ThemeToggle;