import PageHeader from '../components/common/PageHeader.jsx';

export default function Home() {
  return (
    <>
      <PageHeader
        title="Welcome to ShopSphere"
        subtitle="Everything you need, delivered to your door."
      />
      <div className="container py-5">
        <p className="ss-muted">Home page content coming soon.</p>
      </div>
    </>
  );
}
