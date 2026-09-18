import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, enrollInCourse } from "../store";
import { Search, SlidersHorizontal, BookOpen, Layers, CheckCircle2, ChevronRight, User } from "lucide-react";

interface CourseCatalogProps {
  onSelectCourse: (id: string) => void;
  setActiveTab: (tab: string) => void;
}

export function CourseCatalog({ onSelectCourse, setActiveTab }: CourseCatalogProps) {
  const dispatch = useDispatch();
  const { courses, enrollments } = useSelector((state: RootState) => state.courses);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const categories = ["All", "Web Development", "Artificial Intelligence"];
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  const handleEnroll = async (courseId: string) => {
    const result = await (dispatch as any)(enrollInCourse(courseId));
    if (enrollInCourse.fulfilled.match(result)) {
      onSelectCourse(courseId);
      setActiveTab("lessons_viewer");
    }
  };

  // Filter courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "All" || c.category === selectedCategory;
    const matchesLevel = selectedLevel === "All" || c.level === selectedLevel;
    return matchesSearch && matchesCat && matchesLevel;
  });

  const getEnrollment = (courseId: string) => {
    return enrollments.find(e => e.courseId === courseId);
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Curriculum Course Catalog</h2>
        <p className="text-sm text-slate-500 font-medium">Explore enterprise tech modules. Complete quizzes to unlock credentials.</p>
      </div>

      {/* Filter Options Bar */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            id="catalog_search_ipt"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords, topics..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-xs outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 px-3 py-1.5 text-slate-400 font-medium bg-slate-50/50">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
          </div>

          <div className="flex gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10"
                    : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200 hidden md:block" />

          <div className="flex gap-1.5">
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`rounded-lg px-3 py-1.5 font-bold transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {filteredCourses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-slate-50/20">
          <Layers className="mx-auto h-10 w-10 text-slate-300" />
          <h4 className="mt-2 text-sm font-bold text-slate-600">No courses match query</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Try resetting Search text or Category filter buttons.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const enroll = getEnrollment(course.id);
            return (
              <div
                key={course.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
              >
                {/* Thumbnail aspect ratio box */}
                <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[9px] font-mono font-bold text-white uppercase tracking-wider">
                      {course.category}
                    </span>
                    <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[9px] font-mono font-bold text-slate-950 uppercase tracking-wider">
                      {course.level}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-500 transition-colors line-clamp-1">{course.title}</h3>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">{course.description}</p>
                    
                    <div className="mt-4 flex items-center gap-3 border-t border-b border-slate-100 py-2.5 my-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <BookOpen className="h-3.5 w-3.5 text-emerald-500" /> {course.durationHours} hours
                      </span>
                      <span className="h-3 w-px bg-slate-200" />
                      <span className="flex items-center gap-1.5 text-slate-600 font-semibold uppercase font-mono tracking-wider text-[9px]">
                        <User className="h-3 w-3 text-slate-400" /> {course.instructorName}
                      </span>
                    </div>
                  </div>

                  {enroll ? (
                    <div className="mt-3 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600">
                        <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Enrolled</span>
                        <span>{enroll.progressPercentage}% Complete</span>
                      </div>
                      
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-emerald-500 transition-all duration-300" 
                          style={{ width: `${enroll.progressPercentage}%` }}
                        />
                      </div>

                      <button
                        id={`catalog_resume_btn_${course.id}`}
                        onClick={() => { onSelectCourse(course.id); setActiveTab("lessons_viewer"); }}
                        className="flex w-full items-center justify-center gap-1 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800 cursor-pointer"
                      >
                        Resume Training <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`catalog_enroll_btn_${course.id}`}
                      onClick={() => handleEnroll(course.id)}
                      className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-emerald-500 py-3 text-xs font-black text-slate-950 transition-all hover:bg-emerald-400 cursor-pointer shadow-md shadow-emerald-500/10"
                    >
                      Enroll in Course
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
