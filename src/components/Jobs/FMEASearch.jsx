import React, { useState, useEffect, useRef } from 'react';
import './FMEASearch.css';

const FMEASearch = ({ objects, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        // Add click outside listener to close suggestions
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (value) => {
        setSearchTerm(value);
        if (!value.trim()) {
            setSuggestions([]);
            setIsVisible(false);
            return;
        }

        const filtered = objects.filter(obj =>
            obj.name.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
        setIsVisible(true);
    };

    const handleSelect = (object) => {
        setSearchTerm(object.name);
        setIsVisible(false);
        onSelect(object.id);
    };

    return (
        <div className="fmea-search" ref={wrapperRef}>
            <div className="search-input-container">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search nodes..."
                    className="search-input"
                />
                {searchTerm && (
                    <button
                        className="clear-button"
                        onClick={() => {
                            setSearchTerm('');
                            setSuggestions([]);
                            setIsVisible(false);
                        }}
                    >
                        ×
                    </button>
                )}
            </div>
            {isVisible && suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map((obj) => (
                        <li
                            key={obj.id}
                            onClick={() => handleSelect(obj)}
                            className="suggestion-item"
                        >
                            <span className="suggestion-name">{obj.name}</span>
                            <span className="suggestion-level">Level {obj.level}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FMEASearch;
