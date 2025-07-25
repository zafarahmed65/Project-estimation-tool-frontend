"use client";

import { useEffect, useState, useRef } from "react";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import { generateExcel } from "../components/excelGenerator";
import { toast } from "react-toastify";
import { useCreateOrUpdateProjectMutation, useGetAllProjectsQuery } from "../redux/api/projectDetailApi";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiX, FiAlertCircle } from "react-icons/fi";
import { useGetDropdownOptionsQuery } from "../redux/api/dropdownOptionsApi";

export default function Reports() {
    const [rockSize, setRockSize] = useState("");
    const [useCase, setUseCase] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
    const [missingFields, setMissingFields] = useState([]);
    const [capability, setCapability] = useState("");
    const [pillar, setPillar] = useState("");
    const [methodology, setMethodology] = useState("");
    const [isRockSizeCalculated, setIsRockSizeCalculated] = useState(false);

    const currentProject = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("currentProject")) : null;
    const tasks = currentProject?.reports?.tasks || [];

    const [createOrUpdateProject, { isLoading }] = useCreateOrUpdateProjectMutation();
    const { refetch } = useGetAllProjectsQuery();
    const { data: dropdownOptions, isLoading: isDropdownLoading } = useGetDropdownOptionsQuery();

    useEffect(() => {
        if (currentProject?.reports) {
            setCapability(currentProject.reports.capability || "");
            setPillar(currentProject.reports.pillar || "");
            setMethodology(currentProject.reports.methodology || "");
            setRockSize(currentProject.reports.rockSize || "");
            setUseCase(currentProject.reports.useCase || "");
        }
    }, [currentProject]);

    const handleCapabilityChange = (value) => {
        setCapability(value);
        updateLocalStorage("capability", value);
        setIsRockSizeCalculated(false);
    };

    const handlePillarChange = (value) => {
        setPillar(value);
        updateLocalStorage("pillar", value);
        setIsRockSizeCalculated(false);
    };

    const handleMethodologyChange = (value) => {
        setMethodology(value);
        updateLocalStorage("methodology", value);
        setIsRockSizeCalculated(false);
    };

    const calculateRockSize = () => {
        const missing = [];
        if (!capability) missing.push("Capability");
        if (!pillar) missing.push("Pillar");
        if (!methodology) missing.push("Methodology");

        if (missing.length > 0) {
            setMissingFields(missing);
            setIsValidationModalOpen(true);
            return;
        }

        const maxHours = Math.max(...tasks.map(task => Number(task.hours || 0)), 0);
        const departments = [...new Set(tasks.map(task => task.department))];
        const departmentCount = departments.length;

        let calculatedRockSize = "";
        let calculatedUseCase = "";

        if (maxHours <= 3) {
            calculatedRockSize = "Small Rock";
            calculatedUseCase = `< 400hrs | 1 - 2 departments involved. Ex: small application enhancements, chnages to plus or changes to look and feel`;
        } else if (maxHours <= 7) {
            calculatedRockSize = "Medium Rock";
            calculatedUseCase = `400 - 1500hrs | 3 - 6 departments involved. Ex: New Plan builds(Move FSP, PPO to BCBS), changing vendors, C&E automation projects.`;
        } else if (maxHours <= 11) {
            calculatedRockSize = "Big Rock";
            calculatedUseCase = `1500 - 5000hrs | 3 - 6 Departments involved. Ex: Plan Changes or benefit changes(midwest casino benefit change), IT systems upgrades(Windows 10 ,Server upgrades)`;
        } else if (maxHours >= 12) {
            calculatedRockSize = "Boulder";
            calculatedUseCase = `> 5000hrs or highly complex | > 6 Departments involved. Ex: Alaska Merger, EDW, Transparency Project`;
        } else {
            calculatedRockSize = "Custom Rock";
            calculatedUseCase = `This project does not fit typical categories. Review manually.`;
        }

        const updatedProject = {
            ...currentProject,
            reports: {
                ...currentProject.reports,
                rockSize: calculatedRockSize,
                useCase: calculatedUseCase,
                totalHours: maxHours,
                totalResources: tasks.reduce((sum, task) => sum + Number(task.resources || 0), 0),
            },
        };

        localStorage.setItem("currentProject", JSON.stringify(updatedProject));

        setRockSize(calculatedRockSize);
        setUseCase(calculatedUseCase);
        setIsModalOpen(true);
        setIsRockSizeCalculated(true);
    };

    const updateLocalStorage = (key, value) => {
        const updatedProject = { ...currentProject, reports: { ...currentProject.reports, [key]: value } };
        localStorage.setItem("currentProject", JSON.stringify(updatedProject));
    };

    const handleSave = async () => {
        const formattedTasks = tasks.map((task) => ({
            title: task.title || "",
            department: task.department || "-",
            hours: task.hours || 0,
            resources: task.resources || 0,
            comment: task.comment || "-",
        }));

        const projectData = {
            _id: currentProject?._id,
            title: currentProject?.title,
            reports: {
                capability,
                pillar,
                methodology,
                rockSize,
                useCase,
                summary: currentProject?.reports?.summary || "-",
                totalHours: Math.max(...tasks.map(task => Number(task.hours || 0)), 0),
                totalResources: tasks.reduce((sum, task) => sum + Number(task.resources || 0), 0),
                tasks: formattedTasks,
            },
        };

        try {
            const response = await createOrUpdateProject(projectData).unwrap();

            const updatedProject = {
                ...response.data,
                title: currentProject?.title,
                reports: {
                    ...response.data.reports,
                    tasks: formattedTasks,
                },
            };

            localStorage.setItem("currentProject", JSON.stringify(updatedProject));
            toast.success("Project saved successfully!");
            await refetch();
            setIsRockSizeCalculated(false);
        } catch (error) {
            console.error("Error saving project:", error);
            toast.error("Failed to save project.");
        }
    };

    if (!currentProject) {
        return (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                No project data found. Please select a project.
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 flex justify-center transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-lg shadow-md w-full mx-2">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-10 gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Reports</h1>
                    <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
                        <button
                            className="flex items-center gap-2 bg-[#003399] hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-md font-medium text-sm sm:text-base"
                            onClick={async () => {
                                const { generatePdf } = await import("../components/pdfGenerator");
                                generatePdf(tasks, rockSize, useCase);
                            }}
                        >
                            <FaFilePdf className="text-lg" /> Export PDF
                        </button>
                        <button
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-md font-medium text-sm sm:text-base"
                            onClick={() => {
                                generateExcel(tasks, rockSize, useCase);
                            }}
                        >
                            <FaFileExcel className="text-lg" /> Export Excel
                        </button>
                        <button
                            className={`flex items-center gap-2 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white px-3 sm:px-4 py-2 rounded-md font-medium text-sm sm:text-base`}
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Project'}
                        </button>
                    </div>
                </div>

                {/* Executive Summary */}
                <div className="mb-8 sm:mb-12">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Executive Summary</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <SummaryCard label="Total Duration (Months)" value={Math.max(...tasks.map(task => Number(task.hours || 0)), 0)} />
                        <SummaryCard label="Total Resources" value={tasks.reduce((sum, task) => sum + Number(task.resources || 0), 0)} />
                    </div>
                </div>

                {/* Fields */}
                <div className="mb-8 sm:mb-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    <EnhancedDropdownField
                        label="Select Capability *"
                        value={capability}
                        onChange={handleCapabilityChange}
                        options={dropdownOptions?.capability || []}
                        isLoading={isDropdownLoading}
                    />
                    <EnhancedDropdownField
                        label="Select Pillar *"
                        value={pillar}
                        onChange={handlePillarChange}
                        options={dropdownOptions?.pillar || []}
                        isLoading={isDropdownLoading}
                    />
                    <EnhancedDropdownField
                        label="Executive Sponsor *"
                        value={methodology}
                        onChange={handleMethodologyChange}
                        options={dropdownOptions?.executiveSponsor || []}
                        isLoading={isDropdownLoading}
                    />
                </div>

                <div className="text-center mb-5">
                    <motion.button
                        className="cursor-pointer px-6 py-3 rounded-md font-bold text-white text-sm sm:text-base bg-[#003399] hover:bg-indigo-700"
                        onClick={calculateRockSize}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Calculate Rock Size
                    </motion.button>
                </div>

                <TaskTable tasks={tasks} />
                <RockSizeModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} rockSize={rockSize} useCase={useCase} tasks={tasks} />
                <ValidationModal isOpen={isValidationModalOpen} onClose={() => setIsValidationModalOpen(false)} missingFields={missingFields} />
            </div>
        </div>
    );
}

function EnhancedDropdownField({ label, value, onChange, options, isLoading }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="flex flex-col text-left">
            <label className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-semibold mb-1">{label}</label>
            <div className="relative" ref={dropdownRef}>
                <motion.button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none flex justify-between items-center text-sm"
                    whileHover={{ borderColor: "#818cf8" }}
                    disabled={isLoading}
                >
                    <span className={value ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-500"}>
                        {isLoading ? "Loading..." : (value || `Select ${label.replace(" *", "")}`)}
                    </span>
                    {!isLoading && (
                        <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <FiChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                        </motion.div>
                    )}
                </motion.button>

                {!isLoading && (
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.ul
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                            >
                                {options.map((opt, i) => (
                                    <motion.li
                                        key={i}
                                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                                        onClick={() => {
                                            onChange(opt)
                                            setIsDropdownOpen(false)
                                        }}
                                        whileHover={{ backgroundColor: "#eef2ff", x: 2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {opt}
                                    </motion.li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}




function ValidationModal({ isOpen, onClose, missingFields }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-0 w-full max-w-md"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-red-500 px-6 py-4 rounded-t-xl flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <FiAlertCircle className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-bold text-white">Missing Information</h2>
                            </div>
                            <motion.button
                                whileHover={{ rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="p-1.5 rounded-full hover:bg-red-400/20 transition-colors"
                            >
                                <FiX className="w-5 h-5 text-white" />
                            </motion.button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-gray-700 dark:text-gray-300 mb-3">
                                    Please fill in the following required fields before calculating the rock size:
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    {missingFields.map((field, index) => (
                                        <li key={index} className="text-red-600 dark:text-red-400">
                                            {field}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex justify-end">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onClose}
                                    className="px-5 py-2.5 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                                >
                                    Got it
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function RockSizeModal({ isModalOpen, setIsModalOpen, rockSize, useCase, tasks }) {
    if (!useCase) return null;

    const [summaryPart, examplesPart] = useCase.split("Examples:");
    const maxDuration = Math.max(...tasks.map(task => Number(task.hours || 0)), 0);
    const totalResources = tasks.reduce((sum, task) => sum + Number(task.resources || 0), 0);

    return (
        <AnimatePresence>
            {isModalOpen && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-0 w-full max-w-md"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.95 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-[#003399] px-4 py-2 rounded-t-lg flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">Rock Size Details</h2>
                            <motion.button
                                whileHover={{ rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-full hover:bg-blue-900/20"
                            >
                                <FiX className="w-4 h-4 text-white" />
                            </motion.button>
                        </div>

                        <div className="p-4 space-y-3">
                            <FieldRow label="Predicted Size" value={rockSize} />
                            {summaryPart && <FieldRow label="Summary" value={summaryPart.replace("Summary:", "").trim()} />}
                            {examplesPart && <FieldRow label="Examples" value={examplesPart.trim()} italic />}
                            <FieldRow label="Resources" value={totalResources} />
                            <FieldRow label="Duration (Months)" value={maxDuration} />

                            <div className="flex justify-end">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium rounded-md bg-[#003399] text-white hover:bg-indigo-700 transition"
                                >
                                    Close
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Helper compact field
function FieldRow({ label, value, italic = false }) {
    return (
        <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="font-medium text-gray-600 dark:text-gray-300">{label}</div>
            <div className={`col-span-2 text-gray-800 dark:text-gray-200 ${italic ? 'italic' : ''}`}>
                {value}
            </div>
        </div>
    );
}

// Helper Components
function SummaryCard({ label, value }) {
    return (
        <div className="text-left">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase">{label}</div>
            <div className="text-2xl md:text-3xl font-bold text-[#00CCFF] dark:text-white">{value}</div>
        </div>
    );
}

function TaskTable({ tasks }) {
    return (
        <div className="mt-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-4">Department Estimates</h2>
            <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full border border-gray-300 dark:border-gray-700">
                    <thead className="bg-[#003399] text-white">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">TITLE</th>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">DEPARTMENT</th>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">DURATION</th>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">RESOURCES</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                        {tasks.map((task, index) => (
                            <tr
                                key={index}
                                className={`transition hover:bg-gray-100 dark:hover:bg-gray-700 ${index % 2 !== 0 ? "bg-[#f0f8ff] dark:bg-gray-900" : ""}`}
                            >
                                <td className="px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-gray-200">{task.title}</td>
                                <td className="px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-gray-200">{task.department}</td>
                                <td className="px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-gray-200">{task.hours}</td>
                                <td className="px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-gray-200">{task.resources}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {tasks.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-8 text-sm sm:text-base">
                        No tasks available to report.
                    </div>
                )}
            </div>
        </div>
    );
}


