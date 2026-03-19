import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { fetchGallery, uploadPhoto, deletePhoto, GalleryItem } from '../api';
import './Gallery.css';

const PRESET_TAGS = ['Mgławice', 'Galaktyki', 'Planety', 'Księżyc', 'Widefield', 'Gromady', 'Komety', 'Słońce'];

export default function Gallery() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    // Tag filter
    const [activeFilter, setActiveFilter] = useState<string>('');

    // Admin panel
    const [showUpload, setShowUpload] = useState(false);
    const [adminKey, setAdminKey] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // Upload form
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [object, setObject] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [gear, setGear] = useState('');
    const [exposure, setExposure] = useState('');
    const [iso, setIso] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [customTag, setCustomTag] = useState('');

    useEffect(() => {
        fetchGallery()
            .then(res => { setItems(res); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, []);

    // Filtered items
    const filteredItems = activeFilter
        ? items.filter(item => item.tags?.includes(activeFilter))
        : items;

    // All unique tags from all photos
    const allTags = [...new Set(items.flatMap(item => item.tags || []))];

    // Lightbox navigation
    const selectedItem = selectedIndex >= 0 ? filteredItems[selectedIndex] : null;
    const [closing, setClosing] = useState(false);

    function closeLightbox() {
        setClosing(true);
        setTimeout(() => { setSelectedIndex(-1); setClosing(false); }, 250);
    }

    const goNext = useCallback(() => {
        if (selectedIndex < filteredItems.length - 1) setSelectedIndex(selectedIndex + 1);
    }, [selectedIndex, filteredItems.length]);

    const goPrev = useCallback(() => {
        if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
    }, [selectedIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (selectedIndex < 0) return;
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'ArrowRight') goNext();
            else if (e.key === 'ArrowLeft') goPrev();
            else if (e.key === 'Escape') closeLightbox();
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [selectedIndex, goNext, goPrev]);

    function toggleTag(tag: string) {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    }

    function addCustomTag() {
        const tag = customTag.trim();
        if (tag && !selectedTags.includes(tag)) {
            setSelectedTags(prev => [...prev, tag]);
        }
        setCustomTag('');
    }

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        if (!file || !title || !object) return;

        setUploading(true);
        setUploadError('');

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('title', title);
            formData.append('object', object);
            formData.append('description', description);
            formData.append('date', date);
            formData.append('gear', gear);
            formData.append('exposure', exposure);
            formData.append('iso', iso);
            formData.append('tags', JSON.stringify(selectedTags));

            const newItem = await uploadPhoto(formData, adminKey);
            setItems(prev => [newItem, ...prev]);

            // Reset form
            setFile(null);
            setTitle('');
            setObject('');
            setDescription('');
            setDate('');
            setGear('');
            setExposure('');
            setIso('');
            setSelectedTags([]);
            setShowUpload(false);
        } catch (err: any) {
            setUploadError(err.message);
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Czy na pewno chcesz usunąć to zdjęcie?')) return;
        try {
            await deletePhoto(id, adminKey);
            setItems(prev => prev.filter(item => item.id !== id));
            setSelectedIndex(-1);
        } catch (err: any) {
            alert('Błąd usuwania: ' + err.message);
        }
    }

    if (loading) return <div className="module-card loading">⏳ Ładowanie galerii...</div>;
    if (error) return <div className="module-card error">❌ {error}</div>;

    return (
        <div className="module-card gallery">
            <div className="module-header">
                <h2>📷 Moja Galeria Astrofotografii</h2>
                <button className="admin-toggle" onClick={() => setShowUpload(!showUpload)}>
                    {showUpload ? '✕ Zamknij' : '+ Dodaj zdjęcie'}
                </button>
            </div>

            {/* Upload form */}
            {showUpload && (
                <form className="upload-form" onSubmit={handleUpload}>
                    <div className="form-row">
                        <label>Hasło admina</label>
                        <input type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)} placeholder="Wpisz hasło..." required />
                    </div>
                    <div className="form-row">
                        <label>Zdjęcie *</label>
                        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} required />
                    </div>
                    <div className="form-row-double">
                        <div className="form-row">
                            <label>Tytuł *</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="np. Mgławica Oriona" required />
                        </div>
                        <div className="form-row">
                            <label>Obiekt *</label>
                            <input value={object} onChange={e => setObject(e.target.value)} placeholder="np. M42" required />
                        </div>
                    </div>
                    <div className="form-row">
                        <label>Opis</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Dodaj opis..." rows={2}></textarea>
                    </div>

                    {/* Tags */}
                    <div className="form-row">
                        <label>Tagi</label>
                        <div className="tag-selector">
                            {PRESET_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    className={`tag-chip ${selectedTags.includes(tag) ? 'active' : ''}`}
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                            <div className="custom-tag-input">
                                <input
                                    value={customTag}
                                    onChange={e => setCustomTag(e.target.value)}
                                    placeholder="+ własny tag"
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
                                />
                            </div>
                        </div>
                        {selectedTags.filter(t => !PRESET_TAGS.includes(t)).length > 0 && (
                            <div className="custom-tags-row">
                                {selectedTags.filter(t => !PRESET_TAGS.includes(t)).map(tag => (
                                    <span key={tag} className="tag-chip active" onClick={() => toggleTag(tag)}>
                                        {tag} ✕
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-row-double">
                        <div className="form-row">
                            <label>Data zdjęcia</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div className="form-row">
                            <label>Sprzęt</label>
                            <input value={gear} onChange={e => setGear(e.target.value)} placeholder="np. Canon EOS 250D + Sky-Watcher 130P" />
                        </div>
                    </div>
                    <div className="form-row-double">
                        <div className="form-row">
                            <label>Ekspozycja</label>
                            <input value={exposure} onChange={e => setExposure(e.target.value)} placeholder="np. 120x30s" />
                        </div>
                        <div className="form-row">
                            <label>ISO</label>
                            <input value={iso} onChange={e => setIso(e.target.value)} placeholder="np. 1600" />
                        </div>
                    </div>

                    {uploadError && <div className="upload-error">❌ {uploadError}</div>}
                    <button type="submit" className="upload-btn" disabled={uploading}>
                        {uploading ? '⏳ Wysyłanie...' : '🚀 Wyślij zdjęcie'}
                    </button>
                </form>
            )}

            {/* Tag filters */}
            {allTags.length > 0 && (
                <div className="tag-filters">
                    <button
                        className={`tag-filter ${!activeFilter ? 'active' : ''}`}
                        onClick={() => setActiveFilter('')}
                    >
                        Wszystkie ({items.length})
                    </button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            className={`tag-filter ${activeFilter === tag ? 'active' : ''}`}
                            onClick={() => setActiveFilter(activeFilter === tag ? '' : tag)}
                        >
                            {tag} ({items.filter(i => i.tags?.includes(tag)).length})
                        </button>
                    ))}
                </div>
            )}

            {/* Gallery grid */}
            {filteredItems.length === 0 ? (
                <div className="no-photos">
                    {activeFilter ? `Brak zdjęć z tagiem "${activeFilter}"` : 'Brak zdjęć w galerii. Dodaj swoje pierwsze astrofotografie! 🔭'}
                </div>
            ) : (
                <div className="gallery-grid">
                    {filteredItems.map((item, i) => (
                        <div key={item.id} className="gallery-item" onClick={() => setSelectedIndex(i)}>
                            <img src={item.thumbnailUrl || item.imageUrl} alt={item.title} loading="lazy" />
                            <div className="gallery-item-overlay">
                                <span className="gallery-item-title">{item.title}</span>
                                <span className="gallery-item-object">{item.object}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox – rendered via portal to escape backdrop-filter parent */}
            {selectedItem && createPortal(
                <div className={`lightbox ${closing ? 'closing' : ''}`} onClick={closeLightbox}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={closeLightbox}>✕</button>

                        <div className="lightbox-image-container">
                            {/* Prev arrow */}
                            {selectedIndex > 0 && (
                                <button className="lightbox-arrow lightbox-prev" onClick={e => { e.stopPropagation(); goPrev(); }}>‹</button>
                            )}
                            <img src={selectedItem.imageUrl} alt={selectedItem.title} className="lightbox-image" />
                            {/* Next arrow */}
                            {selectedIndex < filteredItems.length - 1 && (
                                <button className="lightbox-arrow lightbox-next" onClick={e => { e.stopPropagation(); goNext(); }}>›</button>
                            )}
                        </div>

                        <div className="lightbox-info">
                            <div className="lightbox-header">
                                <div>
                                    <h3>{selectedItem.title}</h3>
                                    <span className="lightbox-object">{selectedItem.object}</span>
                                </div>
                                <span className="lightbox-counter">{selectedIndex + 1} / {filteredItems.length}</span>
                            </div>

                            {selectedItem.tags && selectedItem.tags.length > 0 && (
                                <div className="lightbox-tags">
                                    {selectedItem.tags.map(tag => (
                                        <span key={tag} className="lightbox-tag">{tag}</span>
                                    ))}
                                </div>
                            )}

                            {selectedItem.description && <p className="lightbox-desc">{selectedItem.description}</p>}

                            <div className="lightbox-meta-grid">
                                {selectedItem.date && (
                                    <div className="meta-item">
                                        <span className="meta-icon">📅</span>
                                        <div>
                                            <span className="meta-label">Data</span>
                                            <span className="meta-value">{selectedItem.date}</span>
                                        </div>
                                    </div>
                                )}
                                {selectedItem.gear && (
                                    <div className="meta-item">
                                        <span className="meta-icon">🔭</span>
                                        <div>
                                            <span className="meta-label">Sprzęt</span>
                                            <span className="meta-value">{selectedItem.gear}</span>
                                        </div>
                                    </div>
                                )}
                                {selectedItem.exposure && (
                                    <div className="meta-item">
                                        <span className="meta-icon">⏱️</span>
                                        <div>
                                            <span className="meta-label">Ekspozycja</span>
                                            <span className="meta-value">{selectedItem.exposure}</span>
                                        </div>
                                    </div>
                                )}
                                {selectedItem.iso && (
                                    <div className="meta-item">
                                        <span className="meta-icon">📷</span>
                                        <div>
                                            <span className="meta-label">ISO</span>
                                            <span className="meta-value">{selectedItem.iso}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {adminKey && (
                                <button className="delete-btn" onClick={() => handleDelete(selectedItem.id)}>
                                    🗑️ Usuń zdjęcie
                                </button>
                            )}
                        </div>
                    </div>

                </div>
                , document.body)}
        </div>
    );
}
