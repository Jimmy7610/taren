import React from 'react';

const IconButton = ({ onClick, icon, ariaLabel, title, className = "" }) => {
    return (
        <button
            onClick={onClick}
            aria-label={ariaLabel}
            title={title}
            className={`icon-button ${className}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                transition: 'background-color var(--transition)',
                color: 'var(--fg)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--card)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
            {icon}
        </button>
    );
};

export default IconButton;
