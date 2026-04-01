import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import thinkingStateLottie from '../../../Lottie/thinking.json';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import { fetchGeneratedRecipes, generateRecipe, GeneratedRecipe } from '../../../services/aiRecipeService';
import { DEMO_RECIPE } from '../../../data/demoData';
import { useCartStore } from '../../../store/cartStore';
import { Product } from '../../../types/product';
import styles from './AIRecipeScreen.module.css';

const FALLBACK_TITLE = 'Ваш напиток готов!';
const FALLBACK_TITLE_ZH = '您的饮品已准备好!';

function useSessionId() {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (
      params.get('sessionId') ||
      sessionStorage.getItem('ai-cha-dialog-session-id') ||
      ''
    );
  }, [location.search]);
}

function useAutoGenerateFlag() {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('autoGenerate') === '1';
  }, [location.search]);
}

function useDemoFlag() {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('demo') === '1';
  }, [location.search]);
}

export default function AIRecipeScreen() {
  const navigate = useNavigate();
  const sessionId = useSessionId();
  const autoGenerate = useAutoGenerateFlag();
  const isDemo = useDemoFlag();
  const addItem = useCartStore((state) => state.addItem);
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // In demo mode, skip API calls and show the pre-built recipe after a brief delay
  useEffect(() => {
    if (!isDemo) return;
    setLoading(true);
    const t = setTimeout(() => {
      setRecipe(DEMO_RECIPE);
      setLoaded(true);
      setLoading(false);
    }, 1800);
    return () => clearTimeout(t);
  }, [isDemo]);

  const loadExisting = useCallback(async () => {
    if (isDemo || !sessionId) return;
    try {
      const recipes = await fetchGeneratedRecipes(sessionId);
      if (recipes.length) {
        setRecipe(recipes[0]);
      }
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки рецептов');
      setLoaded(true);
    }
  }, [isDemo, sessionId]);

  const handleGenerate = useCallback(async () => {
    if (isDemo) {
      // Re-show the demo recipe with a loading effect
      setLoading(true);
      setRecipe(null);
      await new Promise((r) => setTimeout(r, 1200));
      setRecipe(DEMO_RECIPE);
      setLoading(false);
      return;
    }
    if (!sessionId) {
      setError('Нет sessionId диалога. Сначала пройдите диалог.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const generated = await generateRecipe(sessionId);
      setRecipe(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка генерации рецепта');
    } finally {
      setLoading(false);
    }
  }, [isDemo, sessionId]);

  useEffect(() => {
    if (!isDemo) loadExisting();
  }, [isDemo, loadExisting]);

  useEffect(() => {
    if (!isDemo && autoGenerate && loaded && !recipe && !loading) {
      handleGenerate();
    }
  }, [autoGenerate, handleGenerate, isDemo, loaded, loading, recipe]);

  const ingredients = recipe?.ingredients || [];
  const recipeNameRu = recipe?.name_ru?.trim() || '';
  const recipeNameZh = recipe?.name_zh?.trim() || '';
  const showZhName = recipeNameZh && recipeNameZh !== recipeNameRu;
  const infoRow = useMemo(() => {
    const time = recipe?.preparation_time_minutes ? `${recipe.preparation_time_minutes} мин` : '—';
    const temp = recipe?.temperature ? recipe.temperature : '—';
    return `⏱️ ${time} | 🌡️ ${temp}`;
  }, [recipe]);

  const cartProduct = useMemo<Product | null>(() => {
    if (!recipe) return null;
    const price = Number(recipe.total_price || 0);
    const temperature =
      recipe.temperature === 'hot' || recipe.temperature === 'cold' ? recipe.temperature : 'both';
    const ingredientsText = ingredients
      .map((item) => {
        const name = item.ingredient?.name_ru || item.ingredient_id;
        return item.amount ? `${name} (${item.amount})` : name;
      })
      .join(', ');
    return {
      id: `generated-${recipe.id}`,
      category_id: 'generated',
      name_ru: recipe.name_ru || 'Авторский напиток',
      name_zh: recipe.name_zh || recipe.name_ru || '',
      description_ru: recipe.description_ru || '',
      description_zh: '',
      price: Number.isFinite(price) ? price : 0,
      image_url: undefined,
      ingredients_ru: ingredientsText || null,
      ingredients_zh: null,
      temperature,
      is_available: true,
      tags: ['ai-generated']
    };
  }, [ingredients, recipe]);

  useEffect(() => {
    setAddedToCart(false);
  }, [recipe?.id]);

  const handleAddToCart = () => {
    if (!cartProduct) {
      setError('Рецепт ещё не готов. Сначала сгенерируйте напиток.');
      return;
    }
    addItem(cartProduct, 1);
    setAddedToCart(true);
  };

  const handleStartNewDialog = () => {
    navigate('/ai-instruction');
  };

  const handleGoToMenu = () => {
    navigate('/catalog');
  };

  return (
    <div className={styles.page}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingCard}>
            <Lottie animationData={thinkingStateLottie} loop autoplay className="h-40 w-40" />
            <div className={styles.loadingText}>Генерируем рецепт...</div>
          </div>
        </div>
      )}
      <div className={styles.header}>
        <div>
          <div className={styles.title}>{FALLBACK_TITLE}</div>
          <div className={styles.subtitle}>{FALLBACK_TITLE_ZH}</div>
        </div>
        <ThemeToggle />
      </div>

      <div className={styles.card}>
        <div className={styles.recipeName}>
          {recipeNameRu || 'Рецепт еще не создан'}
        </div>
        {showZhName && <div className={styles.recipeNameSecondary}>{recipeNameZh}</div>}
        <div className={styles.description}>{recipe?.description_ru || 'Сформируйте рецепт, чтобы увидеть описание.'}</div>

        <div className={styles.reasoning}>
          <strong>Почему этот напиток?</strong>
          <div>{recipe?.reasoning_ru || 'После генерации здесь появится обоснование.'}</div>
        </div>
        {error && <div className={styles.errorText}>{error}</div>}
      </div>

      <div className={styles.card}>
        <div className={styles.sectionTitle}>Состав</div>
        <div className={styles.ingredients}>
          {ingredients.length === 0 ? (
            <div>Ингредиенты появятся после генерации.</div>
          ) : (
            ingredients.map((item) => (
              <div key={`${item.ingredient_id}-${item.amount}`}>
                • {item.ingredient?.name_ru || item.ingredient_id} {item.amount ? `— ${item.amount}` : ''}
              </div>
            ))
          )}
        </div>

        <div className={styles.sectionTitle} style={{ marginTop: '1.5rem' }}>
          Информация
        </div>
        <div className={styles.infoRow}>{infoRow}</div>
        <div className={styles.price}>{recipe?.total_price ? `${recipe.total_price} ₽` : '—'}</div>

        {recipe?.personal_message && (
          <div className={styles.messageCard}>💌 {recipe.personal_message}</div>
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.buttonPrimary} disabled={loading || !recipe} onClick={handleAddToCart}>
          {addedToCart ? 'Товар успешно добавлен' : 'Добавить в корзину'}
        </button>
        <button type="button" className={styles.buttonSecondary} disabled={loading} onClick={handleGenerate}>
          Попробовать другой рецепт
        </button>
        <button type="button" className={styles.buttonSecondary} onClick={handleStartNewDialog}>
          Новый диалог
        </button>
        <button type="button" className={styles.buttonLink} onClick={handleGoToMenu}>
          Перейти в меню
        </button>
      </div>
    </div>
  );
}
