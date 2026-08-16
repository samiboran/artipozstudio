// src/components/CategoryBar.jsx
import './CategoryBar.css';

export default function CategoryBar() {
  return (
    <nav className="category-bar">
      <a href="/fotograf" className="category-link">Fotoğraf Serileri</a>
      <a href="/fine-art-baski" className="category-link">Fine Art Baskı</a>
    </nav>
  );
}
