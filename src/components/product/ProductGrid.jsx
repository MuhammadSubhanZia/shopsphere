import ProductCard from './ProductCard.jsx';

// How many cards per row at each breakpoint.
const COLUMN_CLASSES = {
  4: 'row-cols-2 row-cols-md-3 row-cols-lg-4',
  3: 'row-cols-2 row-cols-md-3',
};

/** Responsive Bootstrap grid of product cards. Use columns={3} next to a sidebar. */
export default function ProductGrid({ products, columns = 4 }) {
  return (
    <div className={`row ${COLUMN_CLASSES[columns] || COLUMN_CLASSES[4]} g-3 g-md-4`}>
      {products.map((product) => (
        <div className="col" key={product.id}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
