import Button from '../../common/Button/Button';
import Card from '../../common/Card/Card';
import { Product } from '../../../types/product';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <Card
      variant="elevated"
      className="flex h-full flex-col gap-3 transition hover:-translate-y-1 hover:shadow-xl max-[1100px]:gap-2"
    >
      <div className="flex flex-col gap-1">
        <div className="text-h1 font-bold leading-tight max-[1100px]:text-h2">{product.name_ru}</div>
        <div className="text-h3 text-textSecondary max-[1100px]:text-button">{product.name_zh}</div>
        {product.description_ru && (
          <div className="text-button text-textSecondary line-clamp-2 max-[1100px]:text-small">{product.description_ru}</div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-small text-textSecondary">
        <span className="rounded-full bg-grayLighter px-3 py-1">
          {product.temperature === 'hot' ? 'Горячий' : product.temperature === 'cold' ? 'Холодный' : 'Горячий/холодный'}
        </span>
        {product.tags?.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-grayLighter px-3 py-1">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between">
        <div className="text-h1 font-bold text-textPrimary max-[1100px]:text-h2">{Number(product.price).toFixed(0)} ₽</div>
        <Button size="small" className="max-[1100px]:px-5 max-[1100px]:text-button" onClick={() => onAdd(product)}>
          Добавить
        </Button>
      </div>
    </Card>
  );
}

export default ProductCard;

