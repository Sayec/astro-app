import React from 'react';
import './Equipment.css';

const Equipment: React.FC = () => {
    return (
        <section className="equipment-section">
            <div className="equipment-container module-card">
                <div className="module-header" style={{ marginBottom: '20px' }}>
                    <h2>🔭 Sprzęt</h2>
                    <span className="module-subtitle">Zestaw astrofotograficzny</span>
                </div>
                <div className="equipment-grid">

                    {/* Teleskop */}
                    <div className="equipment-category">
                        <h3 className="category-title">TELESKOP</h3>
                        <div className="equipment-list">
                            <div className="equipment-item">
                                <span className="item-name">Sky-Watcher BKP 150/750</span>
                                <span className="item-desc">150mm f/5 Newton</span>
                            </div>
                            <div className="equipment-item">
                                <span className="item-name">Sky-Watcher Evoguide 50</span>
                                <span className="item-desc">Szukacz/guider</span>
                            </div>
                            <div className="equipment-item">
                                <span className="item-name">HEQ5 Pro</span>
                                <span className="item-desc">GoTo, autoguiding</span>
                            </div>
                        </div>
                    </div>

                    {/* Kamera */}
                    <div className="equipment-category border-left">
                        <h3 className="category-title">KAMERA</h3>
                        <div className="equipment-list">
                            <div className="equipment-item">
                                <span className="item-name">ZWO ASI 533 MC Pro Color</span>
                                <span className="item-desc">chłodzona</span>
                            </div>
                            <div className="equipment-item">
                                <span className="item-name">ZWO ASI120MM Mini</span>
                                <span className="item-desc">autoguider</span>
                            </div>
                        </div>
                    </div>

                    {/* Akcesoria */}
                    <div className="equipment-category border-top">
                        <h3 className="category-title">AKCESORIA</h3>
                        <div className="equipment-list">
                            <div className="equipment-item">
                                <span className="item-name">Baader MPCC III</span>
                                <span className="item-desc">korektor komy</span>
                            </div>
                            <div className="equipment-item">
                                <span className="item-name">ASI AIR plus</span>
                                <span className="item-desc">komputer, automatyzacja</span>
                            </div>
                        </div>
                    </div>

                    {/* Software */}
                    <div className="equipment-category border-top border-left">
                        <h3 className="category-title">SOFTWARE</h3>
                        <div className="equipment-list">
                            <div className="equipment-item">
                                <span className="item-name">Deep Sky Stacker</span>
                                <span className="item-desc">stackowanie</span>
                            </div>
                            <div className="equipment-item">
                                <span className="item-name">Photoshop</span>
                                <span className="item-desc">obróbka</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Equipment;
