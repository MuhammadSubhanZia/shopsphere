import { useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';

export default function ProductDetail() {
  const { id } = useParams();

  return (
    <>
      <PageHeader title="Product Details" subtitle={`Viewing product #${id}`} />
      <div className="container py-5">
        <p className="ss-muted">Product detail page coming soon.</p>
      </div>
    </>
  );
}
