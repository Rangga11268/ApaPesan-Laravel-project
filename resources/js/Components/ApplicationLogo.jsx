export default function ApplicationLogo({ className = "w-8 h-8", ...props }) {
    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            {/* Geometric Monogram: Interlocking A-P Geometry */}
            <path
                d="M16 4L5 27H11L13.8 21H20.5C24.0899 21 27 18.0899 27 14.5C27 10.9101 24.0899 8 20.5 8H16L16 4Z"
                className="fill-primary-600 dark:fill-primary-500"
            />
            <path
                d="M16 11H20.5C22.433 11 24 12.567 24 14.5C24 16.433 22.433 18 20.5 18H15.2L16 11Z"
                className="fill-white dark:fill-surface"
            />
            <polygon
                points="16,11 12,21 15,21 17.5,15"
                className="fill-primary-800 dark:fill-primary-300"
            />
        </svg>
    );
}
