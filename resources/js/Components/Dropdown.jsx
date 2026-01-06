import { Transition } from "@headlessui/react";
import { Link } from "@inertiajs/react";
import { createContext, useContext, useState } from "react";

const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);

    return (
        <>
            <div onClick={toggleOpen}>{children}</div>

            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                ></div>
            )}
        </>
    );
};

const Content = ({
    align = "right",
    width = "48",
    contentClasses = "py-1 bg-[#0f1218]/95 backdrop-blur-xl border border-white/10 shadow-2xl",
    direction = "down", // 'down' or 'up'
    children,
}) => {
    const { open, setOpen } = useContext(DropDownContext);

    let alignmentClasses = "origin-top";

    if (align === "left") {
        alignmentClasses = "ltr:origin-top-left rtl:origin-top-right start-0";
    } else if (align === "right") {
        alignmentClasses = "ltr:origin-top-right rtl:origin-top-left end-0";
    }

    let widthClasses = "";

    if (width === "48") {
        widthClasses = "w-48";
    }

    // Direction logic
    let directionClasses = "mt-2";
    if (direction === "up") {
        directionClasses = "bottom-full mb-2 origin-bottom";
        // Adjust alignment origin for up direction
        if (align === "left")
            alignmentClasses =
                "ltr:origin-bottom-left rtl:origin-bottom-right start-0";
        else if (align === "right")
            alignmentClasses =
                "ltr:origin-bottom-right rtl:origin-bottom-left end-0";
    }

    return (
        <>
            <Transition
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    className={`absolute z-50 rounded-md shadow-lg ${alignmentClasses} ${widthClasses} ${directionClasses}`}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className={
                            `rounded-md ring-1 ring-black ring-opacity-5 ` +
                            contentClasses
                        }
                    >
                        {children}
                    </div>
                </div>
            </Transition>
        </>
    );
};

const DropdownLink = ({ className = "", children, ...props }) => {
    return (
        <Link
            {...props}
            className={
                "block w-full px-4 py-2 text-start text-sm leading-5 text-gray-300 transition duration-150 ease-in-out hover:bg-white/5 hover:text-white focus:bg-white/5 focus:outline-none " +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
