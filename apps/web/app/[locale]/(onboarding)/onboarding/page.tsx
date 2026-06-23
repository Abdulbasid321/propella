// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import { useRouter } from 'next/navigation'
// import { differenceInDays, differenceInWeeks } from 'date-fns'
// import { Check } from 'lucide-react'
// import { useTranslations } from 'next-intl'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { useToast } from '@/components/ui/toast'
// import { useSubjects } from '@/lib/hooks/use-subjects'
// import { api } from '@/lib/api-client'
// import { useAuthStore } from '@/lib/stores/auth-store'
// import { cn } from '@/lib/utils/cn'
// import type { Subject } from '@propella/shared'

// // ─── Types ─────────────────────────────────────────────────────────────────

// type ExamType = 'jamb' | 'waec' | 'neco'
// type LearningStyle = 'visual' | 'reading' | 'practice' | 'mixed'
// type StudyWindow = 'early-morning' | 'morning' | 'afternoon' | 'evening'
// type StrengthLevel = 'weak' | 'average' | 'strong'

// interface SubjectStrength {
//   subjectSlug: string
//   level: StrengthLevel
// }

// interface WizardState {
//   examType: ExamType | null
//   intendedCourse: string
//   schoolName: string
//   institutionType: 'university' | 'polytechnic' | 'college' | null
//   learningStyle: LearningStyle | null
//   subjectSlugs: string[]
//   strengths: SubjectStrength[]
//   examDate: string
//   dailyStudyMinutes: number
//   preferredStudyWindows: StudyWindow[]
// }

// // ─── Constants ──────────────────────────────────────────────────────────────

// const COMMON_COURSES = [
//   'Medicine and Surgery',
//   'Law',
//   'Engineering (Electrical)',
//   'Engineering (Civil)',
//   'Engineering (Mechanical)',
//   'Computer Science',
//   'Pharmacy',
//   'Accounting',
//   'Economics',
//   'Mass Communication',
//   'Architecture',
//   'Business Administration',
//   'Nursing',
//   'Agricultural Science',
//   'Political Science',
//   'English Language',
//   'Mathematics',
//   'Chemistry',
//   'Physics',
//   'Biology',
// ]

// const STUDY_WINDOWS: { value: StudyWindow; label: string; time: string }[] = [
//   { value: 'early-morning', label: 'Early Morning', time: '5am – 8am' },
//   { value: 'morning', label: 'Morning', time: '8am – 12pm' },
//   { value: 'afternoon', label: 'Afternoon', time: '12pm – 5pm' },
//   { value: 'evening', label: 'Evening', time: '5pm – 10pm' },
// ]

// // ─── Helper: format minutes ──────────────────────────────────────────────────

// function formatMinutes(mins: number): string {
//   const h = Math.floor(mins / 60)
//   const m = mins % 60
//   if (h === 0) return `${m} min`
//   if (m === 0) return `${h} h`
//   return `${h} h ${m} min`
// }

// // ─── Helper: subject hue ─────────────────────────────────────────────────────

// function getSubjectColor(subject: Subject): string {
//   return subject.hue
// }

// // ─── Progress bar ────────────────────────────────────────────────────────────

// function ProgressBar({ step, total }: { step: number; total: number }) {
//   const pct = Math.round((step / total) * 100)
//   return (
//     <div style={{ marginBottom: 32 }}>
//       <p
//         style={{
//           fontFamily: 'var(--font-mono)',
//           fontSize: 11,
//           fontWeight: 500,
//           letterSpacing: '0.10em',
//           textTransform: 'uppercase',
//           color: 'var(--color-ink-3)',
//           marginBottom: 8,
//         }}
//       >
//         Step {step} of {total}
//       </p>
//       <div
//         style={{
//           height: 2,
//           backgroundColor: 'var(--color-rule)',
//           borderRadius: 'var(--radius-full)',
//           overflow: 'hidden',
//         }}
//       >
//         <div
//           style={{
//             height: '100%',
//             width: `${pct}%`,
//             backgroundColor: 'var(--color-accent)',
//             borderRadius: 'var(--radius-full)',
//             transition: 'width 400ms ease',
//           }}
//         />
//       </div>
//     </div>
//   )
// }

// // ─── Step heading ─────────────────────────────────────────────────────────────

// function StepHeading({ title, sub }: { title: string; sub?: string }) {
//   return (
//     <div style={{ marginBottom: 28 }}>
//       <h1
//         style={{
//           fontFamily: 'var(--font-display)',
//           fontSize: 28,
//           lineHeight: 1.15,
//           letterSpacing: '-0.02em',
//           color: 'var(--color-ink)',
//           marginBottom: sub ? 8 : 0,
//         }}
//       >
//         {title}
//       </h1>
//       {sub && (
//         <p
//           style={{
//             fontSize: 14,
//             color: 'var(--color-ink-2)',
//             lineHeight: 1.5,
//           }}
//         >
//           {sub}
//         </p>
//       )}
//     </div>
//   )
// }

// // ─── Step 1: Choose exam ──────────────────────────────────────────────────────

// const EXAMS: { value: ExamType; name: string; description: string }[] = [
//   {
//     value: 'jamb',
//     name: 'JAMB / UTME',
//     description: 'Unified Tertiary Matriculation Examination — for university, polytechnic, and college of education entry.',
//   },
//   {
//     value: 'waec',
//     name: 'WAEC',
//     description: 'West African Senior School Certificate — widely accepted for employment and further education.',
//   },
//   {
//     value: 'neco',
//     name: 'NECO',
//     description: 'National Examinations Council — national secondary school leaving certificate.',
//   },
// ]

// function Step1({
//   value,
//   onChange,
// }: {
//   value: ExamType | null
//   onChange: (v: ExamType) => void
// }) {
//   const t = useTranslations('onboarding')
//   return (
//     <>
//       <StepHeading
//         title={t('examType')}
//         sub="We will tailor your roadmap to the exact syllabus and marking scheme."
//       />
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//         {EXAMS.map((exam) => {
//           const selected = value === exam.value
//           return (
//             <button
//               key={exam.value}
//               type="button"
//               onClick={() => onChange(exam.value)}
//               style={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'flex-start',
//                 textAlign: 'left',
//                 padding: '16px 20px',
//                 borderRadius: 'var(--radius-md)',
//                 border: `1.5px solid ${selected ? 'var(--color-accent)' : 'var(--color-rule-2)'}`,
//                 backgroundColor: selected ? 'var(--color-accent-tint)' : 'var(--color-card)',
//                 cursor: 'pointer',
//                 transition: 'border-color 150ms, background-color 150ms',
//                 width: '100%',
//               }}
//             >
//               <span
//                 style={{
//                   fontFamily: 'var(--font-display)',
//                   fontSize: 18,
//                   color: 'var(--color-ink)',
//                   fontWeight: selected ? 600 : 400,
//                   marginBottom: 4,
//                 }}
//               >
//                 {exam.name}
//               </span>
//               <span
//                 style={{
//                   fontSize: 13,
//                   color: 'var(--color-ink-2)',
//                   lineHeight: 1.5,
//                 }}
//               >
//                 {exam.description}
//               </span>
//             </button>
//           )
//         })}
//       </div>
//     </>
//   )
// }

// // ─── Step 2A: JAMB course path ────────────────────────────────────────────────

// function Step2Jamb({
//   schoolName,
//   institutionType,
//   onSchoolName,
//   onInstitution,
// }: {
//   schoolName: string
//   institutionType: 'university' | 'polytechnic' | 'college' | null
//   onSchoolName: (v: string) => void
//   onInstitution: (v: 'university' | 'polytechnic' | 'college') => void
// }) {
//   const INSTITUTIONS: { value: 'university' | 'polytechnic' | 'college'; label: string }[] = [
//     { value: 'university', label: 'University' },
//     { value: 'polytechnic', label: 'Polytechnic' },
//     { value: 'college', label: 'College of Education' },
//   ]

//   return (
//     <>
//       <StepHeading
//         title="Where are you headed?"
//         sub="Tell us your school of choice in Nigeria."
//       />
//       <div style={{ marginBottom: 24 }}>
//         <label
//           style={{
//             display: 'block',
//             fontSize: 13,
//             fontWeight: 500,
//             color: 'var(--color-ink-2)',
//             marginBottom: 6,
//           }}
//         >
//           School of choice
//         </label>
//         <Input
//           type="text"
//           placeholder="e.g. University of Lagos, UNILAG, or your institution name"
//           value={schoolName}
//           onChange={(e) => onSchoolName(e.target.value)}
//         />
//       </div>
//       <div>
//         <label
//           style={{
//             display: 'block',
//             fontSize: 13,
//             fontWeight: 500,
//             color: 'var(--color-ink-2)',
//             marginBottom: 10,
//           }}
//         >
//           Institution type
//         </label>
//         <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
//           {INSTITUTIONS.map((inst) => {
//             const active = institutionType === inst.value
//             return (
//               <button
//                 key={inst.value}
//                 type="button"
//                 onClick={() => onInstitution(inst.value)}
//                 style={{
//                   padding: '8px 18px',
//                   borderRadius: 'var(--radius-full)',
//                   border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-rule-2)'}`,
//                   backgroundColor: active ? 'var(--color-accent-tint)' : 'transparent',
//                   color: active ? 'var(--color-accent)' : 'var(--color-ink-2)',
//                   fontSize: 13,
//                   fontWeight: active ? 600 : 400,
//                   cursor: 'pointer',
//                   transition: 'all 150ms',
//                 }}
//               >
//                 {inst.label}
//               </button>
//             )
//           })}
//         </div>
//       </div>
//     </>
//   )
// }

// // ─── Step 2B: WAEC/NECO learning style ───────────────────────────────────────

// const LEARNING_STYLES: { value: LearningStyle; label: string; description: string }[] = [
//   {
//     value: 'visual',
//     label: 'Visual',
//     description: 'Diagrams, charts, and colour-coded notes help you understand best.',
//   },
//   {
//     value: 'reading',
//     label: 'Reading',
//     description: 'You learn by reading textbooks and written summaries thoroughly.',
//   },
//   {
//     value: 'practice',
//     label: 'Practice-heavy',
//     description: 'You grasp concepts fastest by doing many past questions and exercises.',
//   },
//   {
//     value: 'mixed',
//     label: 'Mixed',
//     description: 'You use a combination of methods depending on the subject.',
//   },
// ]

// function Step2Waec({
//   value,
//   onChange,
// }: {
//   value: LearningStyle | null
//   onChange: (v: LearningStyle) => void
// }) {
//   return (
//     <>
//       <StepHeading
//         title="How do you learn best?"
//         sub="We will adjust your study material format to match your style."
//       />
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//         {LEARNING_STYLES.map((style) => {
//           const selected = value === style.value
//           return (
//             <button
//               key={style.value}
//               type="button"
//               onClick={() => onChange(style.value)}
//               style={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'flex-start',
//                 textAlign: 'left',
//                 padding: '14px 18px',
//                 borderRadius: 'var(--radius-md)',
//                 border: `1.5px solid ${selected ? 'var(--color-accent)' : 'var(--color-rule-2)'}`,
//                 backgroundColor: selected ? 'var(--color-accent-tint)' : 'var(--color-card)',
//                 cursor: 'pointer',
//                 transition: 'all 150ms',
//                 width: '100%',
//               }}
//             >
//               <span
//                 style={{
//                   fontSize: 15,
//                   fontWeight: 600,
//                   color: 'var(--color-ink)',
//                   marginBottom: 3,
//                 }}
//               >
//                 {style.label}
//               </span>
//               <span style={{ fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.4 }}>
//                 {style.description}
//               </span>
//             </button>
//           )
//         })}
//       </div>
//     </>
//   )
// }

// // ─── Step 3: Subjects ─────────────────────────────────────────────────────────

// function Step3({
//   subjects,
//   loading,
//   examType,
//   selected,
//   onChange,
// }: {
//   subjects: Subject[]
//   loading: boolean
//   examType: ExamType | null
//   selected: string[]
//   onChange: (slugs: string[]) => void
// }) {
//   const isJamb = examType === 'jamb'
//   const minRequired = isJamb ? 4 : 8
//   const maxAllowed = isJamb ? 4 : 9

//   const toggle = (slug: string) => {
//     if (isJamb && slug === 'english') return // locked
//     if (selected.includes(slug)) {
//       // For JAMB English is always included so can't deselect
//       onChange(selected.filter((s) => s !== slug))
//     } else {
//       if (selected.length >= maxAllowed) return
//       onChange([...selected, slug])
//     }
//   }

//   const selectedCount = selected.length

//   return (
//     <>
//       <StepHeading
//         title="Select your subjects"
//         sub={
//           isJamb
//             ? `English is mandatory. Pick exactly 3 more subjects (${selectedCount}/4 selected).`
//             : `Select between 8 and 9 subjects (${selectedCount}/${maxAllowed} selected).`
//         }
//       />
//       {loading ? (
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
//           {Array.from({ length: 8 }).map((_, i) => (
//             <div
//               key={i}
//               style={{
//                 height: 58,
//                 borderRadius: 'var(--radius-md)',
//                 backgroundColor: 'var(--color-paper-2)',
//                 animation: 'pulse 1.5s ease-in-out infinite',
//               }}
//             />
//           ))}
//         </div>
//       ) : (
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
//           {subjects.map((subject) => {
//             const isSelected = selected.includes(subject.slug)
//             const isLocked = isJamb && subject.slug === 'english'
//             const isDisabled = !isSelected && selected.length >= maxAllowed && !isLocked
//             const topicCount = subject.topics.length
//             const hue = getSubjectColor(subject)

//             return (
//               <button
//                 key={subject.slug}
//                 type="button"
//                 onClick={() => toggle(subject.slug)}
//                 disabled={isDisabled}
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 10,
//                   padding: '11px 14px',
//                   borderRadius: 'var(--radius-md)',
//                   border: `1.5px solid ${isSelected ? hue : 'var(--color-rule-2)'}`,
//                   backgroundColor: isSelected ? `${hue}14` : 'var(--color-card)',
//                   cursor: isDisabled ? 'not-allowed' : 'pointer',
//                   opacity: isDisabled ? 0.45 : 1,
//                   textAlign: 'left',
//                   transition: 'all 150ms',
//                   width: '100%',
//                   minWidth: 0,
//                 }}
//               >
//                 <div
//                   style={{
//                     width: 4,
//                     height: 32,
//                     borderRadius: 'var(--radius-full)',
//                     backgroundColor: hue,
//                     flexShrink: 0,
//                   }}
//                 />
//                 <div style={{ minWidth: 0 }}>
//                   <div
//                     style={{
//                       fontSize: 13,
//                       fontWeight: 600,
//                       color: 'var(--color-ink)',
//                       lineHeight: 1.3,
//                       whiteSpace: 'nowrap',
//                       overflow: 'hidden',
//                       textOverflow: 'ellipsis',
//                     }}
//                   >
//                     {subject.name}
//                     {isLocked && (
//                       <span
//                         style={{
//                           fontSize: 10,
//                           color: 'var(--color-ink-3)',
//                           fontWeight: 400,
//                           marginLeft: 4,
//                         }}
//                       >
//                         (required)
//                       </span>
//                     )}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: 11,
//                       color: 'var(--color-ink-3)',
//                       marginTop: 1,
//                     }}
//                   >
//                     {topicCount} topics
//                   </div>
//                 </div>
//               </button>
//             )
//           })}
//         </div>
//       )}
//     </>
//   )
// }

// // ─── Step 4: Strengths & Weaknesses ──────────────────────────────────────────

// function Step4({
//   subjects,
//   selectedSlugs,
//   strengths,
//   onChange,
// }: {
//   subjects: Subject[]
//   selectedSlugs: string[]
//   strengths: SubjectStrength[]
//   onChange: (strengths: SubjectStrength[]) => void
// }) {
//   const selectedSubjects = subjects.filter((s) => selectedSlugs.includes(s.slug))

//   const getLevel = (slug: string): StrengthLevel => {
//     return strengths.find((s) => s.subjectSlug === slug)?.level ?? 'average'
//   }

//   const setLevel = (slug: string, level: StrengthLevel) => {
//     const next = strengths.filter((s) => s.subjectSlug !== slug)
//     onChange([...next, { subjectSlug: slug, level }])
//   }

//   const LEVELS: { value: StrengthLevel; label: string; color: string }[] = [
//     { value: 'weak', label: 'Weak', color: 'var(--color-danger)' },
//     { value: 'average', label: 'Average', color: 'var(--color-ink-3)' },
//     { value: 'strong', label: 'Strong', color: 'var(--color-success)' },
//   ]

//   return (
//     <>
//       <StepHeading
//         title="Rate your confidence"
//         sub="Be honest — your roadmap allocates more time to subjects you find difficult."
//       />
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//         {selectedSubjects.map((subject) => {
//           const level = getLevel(subject.slug)
//           const hue = getSubjectColor(subject)
//           return (
//             <div
//               key={subject.slug}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'space-between',
//                 gap: 12,
//                 padding: '12px 16px',
//                 borderRadius: 'var(--radius-md)',
//                 border: '1px solid var(--color-rule)',
//                 backgroundColor: 'var(--color-card)',
//               }}
//             >
//               <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
//                 <div
//                   style={{
//                     width: 4,
//                     height: 28,
//                     borderRadius: 'var(--radius-full)',
//                     backgroundColor: hue,
//                     flexShrink: 0,
//                   }}
//                 />
//                 <span
//                   style={{
//                     fontSize: 13,
//                     fontWeight: 600,
//                     color: 'var(--color-ink)',
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis',
//                     whiteSpace: 'nowrap',
//                   }}
//                 >
//                   {subject.name}
//                 </span>
//               </div>
//               <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
//                 {LEVELS.map((lv) => {
//                   const active = level === lv.value
//                   return (
//                     <button
//                       key={lv.value}
//                       type="button"
//                       onClick={() => setLevel(subject.slug, lv.value)}
//                       style={{
//                         padding: '5px 10px',
//                         borderRadius: 'var(--radius-full)',
//                         border: `1.5px solid ${active ? lv.color : 'var(--color-rule-2)'}`,
//                         backgroundColor: active ? `${lv.color}18` : 'transparent',
//                         color: active ? lv.color : 'var(--color-ink-3)',
//                         fontSize: 12,
//                         fontWeight: active ? 600 : 400,
//                         cursor: 'pointer',
//                         transition: 'all 150ms',
//                       }}
//                     >
//                       {lv.label}
//                     </button>
//                   )
//                 })}
//               </div>
//             </div>
//           )
//         })}
//       </div>
//     </>
//   )
// }

// // ─── Step 5: Exam date ────────────────────────────────────────────────────────

// function Step5({
//   value,
//   onChange,
// }: {
//   value: string
//   onChange: (v: string) => void
// }) {
//   const t = useTranslations('onboarding')
//   const today = new Date()
//   const todayStr = today.toISOString().split('T')[0] ?? ''

//   const daysAway = value
//     ? differenceInDays(new Date(value), today)
//     : null
//   const weeksAway = daysAway !== null ? Math.round(daysAway / 7) : null

//   let feedbackColor = 'var(--color-ink-2)'
//   let feedbackMessage = ''

//   if (daysAway !== null) {
//     if (daysAway < 30) {
//       feedbackColor = 'var(--color-danger)'
//       feedbackMessage = 'Very tight. Focus only on the highest-weight topics.'
//     } else if (daysAway < 60) {
//       feedbackColor = 'var(--color-warning)'
//       feedbackMessage = 'Tight timeline. Consistent daily effort will be essential.'
//     } else if (daysAway <= 180) {
//       feedbackColor = 'var(--color-success)'
//       feedbackMessage = 'Good lead time. A steady pace will serve you well.'
//     } else {
//       feedbackColor = 'var(--color-ink-3)'
//       feedbackMessage = 'Plenty of time — a calm, consistent schedule will work.'
//     }
//   }

//   return (
//     <>
//       <StepHeading
//         title={t('examDate')}
//         sub="Your roadmap is built backwards from this date."
//       />
//       <div style={{ marginBottom: 20 }}>
//         <Input
//           type="date"
//           value={value}
//           min={todayStr}
//           onChange={(e) => onChange(e.target.value)}
//           style={{ fontSize: 16 }}
//         />
//       </div>
//       {daysAway !== null && daysAway > 0 && (
//         <div
//           style={{
//             padding: '14px 16px',
//             borderRadius: 'var(--radius-md)',
//             border: `1px solid ${feedbackColor}30`,
//             backgroundColor: `${feedbackColor}0D`,
//           }}
//         >
//           <p
//             style={{
//               fontFamily: 'var(--font-mono)',
//               fontSize: 13,
//               fontWeight: 600,
//               color: feedbackColor,
//               marginBottom: 4,
//             }}
//           >
//             {weeksAway} weeks away — {daysAway} days.
//           </p>
//           <p style={{ fontSize: 13, color: 'var(--color-ink-2)' }}>{feedbackMessage}</p>
//         </div>
//       )}
//       {daysAway !== null && daysAway <= 0 && (
//         <p style={{ fontSize: 13, color: 'var(--color-danger)' }}>
//           Please select a date in the future.
//         </p>
//       )}
//     </>
//   )
// }

// // ─── Step 6: Daily commitment ─────────────────────────────────────────────────

// function Step6({
//   minutes,
//   windows,
//   onMinutes,
//   onWindows,
// }: {
//   minutes: number
//   windows: StudyWindow[]
//   onMinutes: (v: number) => void
//   onWindows: (v: StudyWindow[]) => void
// }) {
//   const MIN = 30
//   const MAX = 360
//   const STEP = 15

//   const toggleWindow = (w: StudyWindow) => {
//     if (windows.includes(w)) {
//       onWindows(windows.filter((x) => x !== w))
//     } else {
//       onWindows([...windows, w])
//     }
//   }

//   return (
//     <>
//       <StepHeading
//         title="How much can you study each day?"
//         sub="Be realistic — a plan you stick to is better than an ambitious one you abandon."
//       />

//       {/* Numeric display */}
//       <div style={{ textAlign: 'center', marginBottom: 20 }}>
//         <span
//           style={{
//             fontFamily: 'var(--font-display)',
//             fontSize: 52,
//             lineHeight: 1,
//             color: 'var(--color-ink)',
//             letterSpacing: '-0.02em',
//           }}
//         >
//           {formatMinutes(minutes)}
//         </span>
//         <p style={{ fontSize: 13, color: 'var(--color-ink-3)', marginTop: 4 }}>
//           per day
//         </p>
//       </div>

//       {/* Slider */}
//       <div style={{ marginBottom: 32 }}>
//         <input
//           type="range"
//           min={MIN}
//           max={MAX}
//           step={STEP}
//           value={minutes}
//           onChange={(e) => onMinutes(Number(e.target.value))}
//           style={{
//             width: '100%',
//             accentColor: 'var(--color-accent)',
//             height: 6,
//             cursor: 'pointer',
//           }}
//         />
//         <div
//           style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             marginTop: 6,
//           }}
//         >
//           <span style={{ fontSize: 11, color: 'var(--color-ink-3)', fontFamily: 'var(--font-mono)' }}>
//             30 min
//           </span>
//           <span style={{ fontSize: 11, color: 'var(--color-ink-3)', fontFamily: 'var(--font-mono)' }}>
//             6 h
//           </span>
//         </div>
//       </div>

//       {/* Preferred windows */}
//       <div>
//         <label
//           style={{
//             display: 'block',
//             fontSize: 13,
//             fontWeight: 500,
//             color: 'var(--color-ink-2)',
//             marginBottom: 10,
//           }}
//         >
//           Preferred study times (select all that apply)
//         </label>
//         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
//           {STUDY_WINDOWS.map((w) => {
//             const active = windows.includes(w.value)
//             return (
//               <button
//                 key={w.value}
//                 type="button"
//                 onClick={() => toggleWindow(w.value)}
//                 style={{
//                   padding: '8px 14px',
//                   borderRadius: 'var(--radius-full)',
//                   border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-rule-2)'}`,
//                   backgroundColor: active ? 'var(--color-accent-tint)' : 'transparent',
//                   color: active ? 'var(--color-accent)' : 'var(--color-ink-2)',
//                   fontSize: 13,
//                   fontWeight: active ? 600 : 400,
//                   cursor: 'pointer',
//                   transition: 'all 150ms',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'center',
//                   gap: 2,
//                 }}
//               >
//                 <span>{w.label}</span>
//                 <span style={{ fontSize: 11, opacity: 0.7 }}>{w.time}</span>
//               </button>
//             )
//           })}
//         </div>
//       </div>
//     </>
//   )
// }

// // ─── Step 7: Generating ───────────────────────────────────────────────────────

// const GENERATING_STEPS = [
//   'Analysing your subjects and strength profile',
//   'Calculating your timeline and daily targets',
//   'Ordering topics by exam weight and prerequisites',
//   'Scheduling your spaced repetition calendar',
// ]

// function Step7Generating({
//   subjectCount,
//   topicCount,
//   weekCount,
// }: {
//   subjectCount: number
//   topicCount: number
//   weekCount: number
// }) {
//   const [ticked, setTicked] = useState(0)

//   useEffect(() => {
//     if (ticked >= GENERATING_STEPS.length) return
//     const t = setTimeout(() => setTicked((n) => n + 1), 600)
//     return () => clearTimeout(t)
//   }, [ticked])

//   return (
//     <div style={{ paddingTop: 24 }}>
//       <h1
//         style={{
//           fontFamily: 'var(--font-display)',
//           fontSize: 28,
//           lineHeight: 1.15,
//           letterSpacing: '-0.02em',
//           color: 'var(--color-ink)',
//           marginBottom: 10,
//         }}
//       >
//         Building your roadmap...
//       </h1>
//       <p style={{ fontSize: 14, color: 'var(--color-ink-2)', marginBottom: 32, lineHeight: 1.5 }}>
//         Mapping {topicCount} topics across {subjectCount} subjects over {weekCount} weeks.
//       </p>

//       <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//         {GENERATING_STEPS.map((label, i) => {
//           const done = i < ticked
//           const active = i === ticked
//           return (
//             <div
//               key={i}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 12,
//                 opacity: done || active ? 1 : 0.3,
//                 transition: 'opacity 400ms ease',
//               }}
//             >
//               <div
//                 style={{
//                   width: 24,
//                   height: 24,
//                   borderRadius: 'var(--radius-full)',
//                   border: `2px solid ${done ? 'var(--color-success)' : active ? 'var(--color-accent)' : 'var(--color-rule-2)'}`,
//                   backgroundColor: done ? 'var(--color-success)' : 'transparent',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   flexShrink: 0,
//                   transition: 'all 300ms',
//                 }}
//               >
//                 {done && <Check size={13} color="white" strokeWidth={2.5} />}
//                 {active && (
//                   <div
//                     style={{
//                       width: 8,
//                       height: 8,
//                       borderRadius: 'var(--radius-full)',
//                       backgroundColor: 'var(--color-accent)',
//                       animation: 'pulse 1s ease-in-out infinite',
//                     }}
//                   />
//                 )}
//               </div>
//               <span
//                 style={{
//                   fontSize: 14,
//                   color: done ? 'var(--color-ink)' : 'var(--color-ink-2)',
//                   fontWeight: done ? 500 : 400,
//                 }}
//               >
//                 {label}
//               </span>
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// // ─── Main Wizard ──────────────────────────────────────────────────────────────

// export default function OnboardingPage() {
//   const tCommon = useTranslations('common')
//   const router = useRouter()
//   const { toast } = useToast()
//   const setUser = useAuthStore((s) => s.setUser)

//   const [currentStep, setCurrentStep] = useState(1)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const [state, setState] = useState<WizardState>({
//     examType: null,
//     intendedCourse: '',
//     schoolName: '',
//     institutionType: null,
//     learningStyle: null,
//     subjectSlugs: [],
//     strengths: [],
//     examDate: '',
//     dailyStudyMinutes: 120,
//     preferredStudyWindows: ['morning'],
//   })

//   const { data: subjectsData, isLoading: subjectsLoading } = useSubjects()
//   const subjects = subjectsData ?? []

//   // Pre-select English for JAMB
//   useEffect(() => {
//     if (state.examType === 'jamb' && !state.subjectSlugs.includes('english')) {
//       setState((s) => ({ ...s, subjectSlugs: ['english', ...s.subjectSlugs.filter((x) => x !== 'english')] }))
//     }
//   }, [state.examType]) // eslint-disable-line react-hooks/exhaustive-deps

//   // Initialise strengths when subjects change
//   useEffect(() => {
//     const slugs = state.subjectSlugs
//     if (slugs.length === 0) return
//     const existing = new Set(state.strengths.map((s) => s.subjectSlug))
//     const missing = slugs.filter((s) => !existing.has(s))
//     if (missing.length > 0) {
//       setState((prev) => ({
//         ...prev,
//         strengths: [
//           ...prev.strengths,
//           ...missing.map((slug) => ({ subjectSlug: slug, level: 'average' as StrengthLevel })),
//         ],
//       }))
//     }
//   }, [state.subjectSlugs]) // eslint-disable-line react-hooks/exhaustive-deps

//   const totalWeeks = state.examDate
//     ? Math.max(1, Math.round(differenceInDays(new Date(state.examDate), new Date()) / 7))
//     : 0

//   const totalTopics = subjects
//     .filter((s) => state.subjectSlugs.includes(s.slug))
//     .reduce((sum, s) => sum + s.topics.length, 0)

//   // The user-visible step count is 6 (step 7 is the generating screen)
//   const VISIBLE_STEPS = 6

//   // Validation per step
//   const canProceed = useCallback((): boolean => {
//     switch (currentStep) {
//       case 1:
//         return state.examType !== null
//       case 2:
//         if (state.examType === 'jamb') return true // course/institution are optional
//         return state.learningStyle !== null
//       case 3: {
//         const min = state.examType === 'jamb' ? 4 : 8
//         return state.subjectSlugs.length >= min
//       }
//       case 4:
//         return true // always valid — defaults to average
//       case 5:
//         return state.examDate !== '' && differenceInDays(new Date(state.examDate), new Date()) > 0
//       case 6:
//         return state.preferredStudyWindows.length > 0
//       default:
//         return true
//     }
//   }, [currentStep, state])

//   // API call per step
//   const persistStep = useCallback(async (step: number): Promise<boolean> => {
//     try {
//       switch (step) {
//         case 1:
//           await api.post('/onboarding/step/1', { examType: state.examType })
//           break
//         case 2:
//           if (state.examType === 'jamb') {
//             await api.post('/onboarding/step/2/jamb', {
//               schoolName: state.schoolName || undefined,
//               institutionType: state.institutionType || undefined,
//             })
//           } else {
//             await api.post('/onboarding/step/2/waec', {
//               learningStyle: state.learningStyle,
//             })
//           }
//           break
//         case 3:
//           await api.post('/onboarding/step/3', { subjectSlugs: state.subjectSlugs })
//           break
//         case 4:
//           await api.post('/onboarding/step/4', { strengths: state.strengths })
//           break
//         case 5: {
//           // Convert date string to ISO datetime
//           const dateObj = new Date(state.examDate)
//           dateObj.setUTCHours(12, 0, 0, 0)
//           await api.post('/onboarding/step/5', { examDate: dateObj.toISOString() })
//           break
//         }
//         case 6:
//           await api.post('/onboarding/step/6', {
//             dailyStudyMinutes: state.dailyStudyMinutes,
//             preferredStudyWindows: state.preferredStudyWindows,
//           })
//           break
//       }
//       return true
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Something went wrong'
//       toast({
//         title: 'Could not save progress',
//         description: message,
//         variant: 'danger',
//       })
//       return false
//     }
//   }, [state, toast])

//   const handleContinue = async () => {
//     if (!canProceed()) return
//     setIsSubmitting(true)

//     const saved = await persistStep(currentStep)
//     setIsSubmitting(false)

//     if (!saved) return // error toast shown inside persistStep

//     if (currentStep === 6) {
//       // Move to generating screen then complete
//       setCurrentStep(7)
//       try {
//         const result = await api.post<{
//           data: {
//             user: {
//               id: string
//               name: string
//               email: string
//               plan: 'free' | 'scholar'
//               onboardingCompleted: boolean
//               onboardingStep: number
//               theme: 'system' | 'light' | 'dark'
//               timezone: string
//               avatarUrl?: string
//             }
//           }
//         }>('/onboarding/complete')
//         setUser(result.data.user)
//       } catch (err) {
//         const message = err instanceof Error ? err.message : 'Failed to complete onboarding'
//         toast({ title: 'Roadmap generation failed', description: message, variant: 'danger' })
//       }
//       // Wait for all the checklist ticks (4 * 600ms + buffer) then redirect
//       setTimeout(() => {
//         router.push('/dashboard')
//       }, 3200)
//       return
//     }

//     setCurrentStep((s) => s + 1)
//   }

//   const handleBack = () => {
//     if (currentStep <= 1) return
//     setCurrentStep((s) => s - 1)
//   }

//   // Render
//   return (
//     <div style={{ width: '100%', maxWidth: 540 }}>
//       {currentStep <= VISIBLE_STEPS && (
//         <ProgressBar step={currentStep} total={VISIBLE_STEPS} />
//       )}

//       {/* Step content */}
//       {currentStep === 1 && (
//         <Step1
//           value={state.examType}
//           onChange={(v) => setState((s) => ({ ...s, examType: v }))}
//         />
//       )}

//       {currentStep === 2 && state.examType === 'jamb' && (
//         <Step2Jamb
//           course={state.intendedCourse}
//           institutionType={state.institutionType}
//           onCourse={(v) => setState((s) => ({ ...s, intendedCourse: v }))}
//           onInstitution={(v) => setState((s) => ({ ...s, institutionType: v }))}
//         />
//       )}

//       {currentStep === 2 && state.examType !== 'jamb' && (
//         <Step2Waec
//           value={state.learningStyle}
//           onChange={(v) => setState((s) => ({ ...s, learningStyle: v }))}
//         />
//       )}

//       {currentStep === 3 && (
//         <Step3
//           subjects={subjects}
//           loading={subjectsLoading}
//           examType={state.examType}
//           selected={state.subjectSlugs}
//           onChange={(slugs) => setState((s) => ({ ...s, subjectSlugs: slugs }))}
//         />
//       )}

//       {currentStep === 4 && (
//         <Step4
//           subjects={subjects}
//           selectedSlugs={state.subjectSlugs}
//           strengths={state.strengths}
//           onChange={(strengths) => setState((s) => ({ ...s, strengths }))}
//         />
//       )}

//       {currentStep === 5 && (
//         <Step5
//           value={state.examDate}
//           onChange={(v) => setState((s) => ({ ...s, examDate: v }))}
//         />
//       )}

//       {currentStep === 6 && (
//         <Step6
//           minutes={state.dailyStudyMinutes}
//           windows={state.preferredStudyWindows}
//           onMinutes={(v) => setState((s) => ({ ...s, dailyStudyMinutes: v }))}
//           onWindows={(v) => setState((s) => ({ ...s, preferredStudyWindows: v }))}
//         />
//       )}

//       {currentStep === 7 && (
//         <Step7Generating
//           subjectCount={state.subjectSlugs.length}
//           topicCount={totalTopics}
//           weekCount={totalWeeks}
//         />
//       )}

//       {/* Navigation */}
//       {currentStep <= VISIBLE_STEPS && (
//         <div
//           style={{
//             display: 'flex',
//             flexDirection: 'column',
//             gap: 12,
//             marginTop: 36,
//           }}
//         >
//           <Button
//             variant="accent"
//             size="lg"
//             onClick={handleContinue}
//             disabled={!canProceed() || isSubmitting}
//             style={{ width: '100%' }}
//           >
//             {isSubmitting
//               ? 'Saving...'
//               : currentStep === VISIBLE_STEPS
//               ? 'Build my roadmap'
//               : tCommon('continue')}
//           </Button>

//           {currentStep > 1 && (
//             <Button
//               variant="ghost"
//               size="default"
//               onClick={handleBack}
//               disabled={isSubmitting}
//               style={{ width: '100%' }}
//             >
//               {tCommon('back')}
//             </Button>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }


// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import { useRouter } from '@/lib/i18n/navigation'
// import { differenceInDays, differenceInWeeks } from 'date-fns'
// import { Check } from 'lucide-react'
// import { useTranslations } from 'next-intl'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { useToast } from '@/components/ui/toast'
// import { useSubjects } from '@/lib/hooks/use-subjects'
// import { api } from '@/lib/api-client'
// import { useAuthStore } from '@/lib/stores/auth-store'
// import { cn } from '@/lib/utils/cn'
// import type { Subject } from '@propella/shared'

// // ─── Types ─────────────────────────────────────────────────────────────────

// type ExamType = 'jamb' | 'waec' | 'neco'
// type LearningStyle = 'visual' | 'reading' | 'practice' | 'mixed'
// type StudyWindow = 'early-morning' | 'morning' | 'afternoon' | 'evening'
// type StrengthLevel = 'weak' | 'average' | 'strong'

// interface SubjectStrength {
//   subjectSlug: string
//   level: StrengthLevel
// }

// interface WizardState {
//   examTypes: ExamType[]
//   intendedCourse: string
//   institutionType: 'university' | 'polytechnic' | 'college' | null
//   learningStyle: LearningStyle | null
//   subjectSlugs: string[]
//   strengths: SubjectStrength[]
//   examDate: string
//   dailyStudyMinutes: number
//   preferredStudyWindows: StudyWindow[]
// }

// // ─── Constants ──────────────────────────────────────────────────────────────

// const COMMON_COURSES = [
//   'Medicine and Surgery',
//   'Law',
//   'Engineering (Electrical)',
//   'Engineering (Civil)',
//   'Engineering (Mechanical)',
//   'Computer Science',
//   'Pharmacy',
//   'Accounting',
//   'Economics',
//   'Mass Communication',
//   'Architecture',
//   'Business Administration',
//   'Nursing',
//   'Agricultural Science',
//   'Political Science',
//   'English Language',
//   'Mathematics',
//   'Chemistry',
//   'Physics',
//   'Biology',
// ]

// const STUDY_WINDOWS: { value: StudyWindow; label: string; time: string }[] = [
//   { value: 'early-morning', label: 'Early Morning', time: '5am – 8am' },
//   { value: 'morning', label: 'Morning', time: '8am – 12pm' },
//   { value: 'afternoon', label: 'Afternoon', time: '12pm – 5pm' },
//   { value: 'evening', label: 'Evening', time: '5pm – 10pm' },
// ]

// // ─── Helper: format minutes ──────────────────────────────────────────────────

// function formatMinutes(mins: number): string {
//   const h = Math.floor(mins / 60)
//   const m = mins % 60
//   if (h === 0) return `${m} min`
//   if (m === 0) return `${h} h`
//   return `${h} h ${m} min`
// }

// // ─── Helper: subject hue ─────────────────────────────────────────────────────

// function getSubjectColor(subject: Subject): string {
//   return subject.hue
// }

// // ─── Helper: subject count rules for a set of selected exams ────────────────
// // JAMB alone requires exactly 4 (English + 3). WAEC/NECO require 8–9.
// // When JAMB is combined with WAEC/NECO we use the wider 8–9 range, since it
// // comfortably covers JAMB's smaller requirement and English stays locked in.

// function getSubjectLimits(examTypes: ExamType[]): { min: number; max: number } {
//   const hasJamb = examTypes.includes('jamb')
//   const hasWaecOrNeco = examTypes.includes('waec') || examTypes.includes('neco')

//   if (hasWaecOrNeco) return { min: 8, max: 9 }
//   if (hasJamb) return { min: 4, max: 4 }
//   return { min: 8, max: 9 }
// }

// // ─── Progress bar ────────────────────────────────────────────────────────────

// function ProgressBar({ step, total }: { step: number; total: number }) {
//   const pct = Math.round((step / total) * 100)
//   return (
//     <div style={{ marginBottom: 32 }}>
//       <p
//         style={{
//           fontFamily: 'var(--font-mono)',
//           fontSize: 11,
//           fontWeight: 500,
//           letterSpacing: '0.10em',
//           textTransform: 'uppercase',
//           color: 'var(--color-ink-3)',
//           marginBottom: 8,
//         }}
//       >
//         Step {step} of {total}
//       </p>
//       <div
//         style={{
//           height: 2,
//           backgroundColor: 'var(--color-rule)',
//           borderRadius: 'var(--radius-full)',
//           overflow: 'hidden',
//         }}
//       >
//         <div
//           style={{
//             height: '100%',
//             width: `${pct}%`,
//             backgroundColor: 'var(--color-accent)',
//             borderRadius: 'var(--radius-full)',
//             transition: 'width 400ms ease',
//           }}
//         />
//       </div>
//     </div>
//   )
// }

// // ─── Step heading ─────────────────────────────────────────────────────────────

// function StepHeading({ title, sub }: { title: string; sub?: string }) {
//   return (
//     <div style={{ marginBottom: 28 }}>
//       <h1
//         style={{
//           fontFamily: 'var(--font-display)',
//           fontSize: 28,
//           lineHeight: 1.15,
//           letterSpacing: '-0.02em',
//           color: 'var(--color-ink)',
//           marginBottom: sub ? 8 : 0,
//         }}
//       >
//         {title}
//       </h1>
//       {sub && (
//         <p
//           style={{
//             fontSize: 14,
//             color: 'var(--color-ink-2)',
//             lineHeight: 1.5,
//           }}
//         >
//           {sub}
//         </p>
//       )}
//     </div>
//   )
// }

// // ─── Step 1: Choose exam ──────────────────────────────────────────────────────

// const EXAMS: { value: ExamType; name: string; description: string }[] = [
//   {
//     value: 'jamb',
//     name: 'JAMB / UTME',
//     description: 'Unified Tertiary Matriculation Examination — for university, polytechnic, and college of education entry.',
//   },
//   {
//     value: 'waec',
//     name: 'WAEC',
//     description: 'West African Senior School Certificate — widely accepted for employment and further education.',
//   },
//   {
//     value: 'neco',
//     name: 'NECO',
//     description: 'National Examinations Council — national secondary school leaving certificate.',
//   },
// ]

// function Step1({
//   value,
//   onChange,
// }: {
//   value: ExamType[]
//   onChange: (v: ExamType[]) => void
// }) {
//   const t = useTranslations('onboarding')

//   const toggle = (exam: ExamType) => {
//     if (value.includes(exam)) {
//       onChange(value.filter((v) => v !== exam))
//     } else {
//       onChange([...value, exam])
//     }
//   }

//   return (
//     <>
//       <StepHeading
//         title={t('examType')}
//         sub="Select every exam you're preparing for — we will tailor your roadmap to each syllabus and marking scheme."
//       />
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//         {EXAMS.map((exam) => {
//           const selected = value.includes(exam.value)
//           return (
//             <button
//               key={exam.value}
//               type="button"
//               onClick={() => toggle(exam.value)}
//               aria-pressed={selected}
//               style={{
//                 display: 'flex',
//                 alignItems: 'flex-start',
//                 gap: 12,
//                 textAlign: 'left',
//                 padding: '16px 20px',
//                 borderRadius: 'var(--radius-md)',
//                 border: `1.5px solid ${selected ? 'var(--color-accent)' : 'var(--color-rule-2)'}`,
//                 backgroundColor: selected ? 'var(--color-accent-tint)' : 'var(--color-card)',
//                 cursor: 'pointer',
//                 transition: 'border-color 150ms, background-color 150ms',
//                 width: '100%',
//               }}
//             >
//               <div
//                 style={{
//                   width: 20,
//                   height: 20,
//                   borderRadius: 4,
//                   border: `1.5px solid ${selected ? 'var(--color-accent)' : 'var(--color-rule-2)'}`,
//                   backgroundColor: selected ? 'var(--color-accent)' : 'transparent',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   flexShrink: 0,
//                   marginTop: 2,
//                   transition: 'all 150ms',
//                 }}
//               >
//                 {selected && <Check size={13} color="white" strokeWidth={2.5} />}
//               </div>
//               <div style={{ display: 'flex', flexDirection: 'column' }}>
//                 <span
//                   style={{
//                     fontFamily: 'var(--font-display)',
//                     fontSize: 18,
//                     color: 'var(--color-ink)',
//                     fontWeight: selected ? 600 : 400,
//                     marginBottom: 4,
//                   }}
//                 >
//                   {exam.name}
//                 </span>
//                 <span
//                   style={{
//                     fontSize: 13,
//                     color: 'var(--color-ink-2)',
//                     lineHeight: 1.5,
//                   }}
//                 >
//                   {exam.description}
//                 </span>
//               </div>
//             </button>
//           )
//         })}
//       </div>
//     </>
//   )
// }

// ─── Step 2A: JAMB course path ────────────────────────────────────────────────

// function Step2Jamb({
//   schoolName,
//   institutionType,
//   onSchoolName,
//   onInstitution,
// }: {
//   schoolName: string
//   institutionType: 'university' | 'polytechnic' | 'college' | null
//   onSchoolName: (v: string) => void
//   onInstitution: (v: 'university' | 'polytechnic' | 'college') => void
// }) {
//   const INSTITUTIONS: { value: 'university' | 'polytechnic' | 'college'; label: string }[] = [
//     { value: 'university', label: 'University' },
//     { value: 'polytechnic', label: 'Polytechnic' },
//     { value: 'college', label: 'College of Education' },
//   ]

//   return (
//     <>
//       <StepHeading
//         title="Where are you headed?"
//         sub="Tell us your school of choice in Nigeria."
//       />
//       <div style={{ marginBottom: 24, position: 'relative' }}>
//         <label
//           style={{
//             display: 'block',
//             fontSize: 13,
//             fontWeight: 500,
//             color: 'var(--color-ink-2)',
//             marginBottom: 6,
//           }}
//         >
//           School of choice
//         </label>
//         <Input
//           type="text"
//           placeholder="e.g. University of Lagos, UNILAG, or your institution name"
//           value={schoolName}
//           onChange={(e) => onSchoolName(e.target.value)}
//         />
//       </div>
//       <div>
//         <label
//           style={{
//             display: 'block',
//             fontSize: 13,
//             fontWeight: 500,
//             color: 'var(--color-ink-2)',
//             marginBottom: 10,
//           }}
//         >
//           Institution type
//         </label>
//         <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
//           {INSTITUTIONS.map((inst) => {
//             const active = institutionType === inst.value
//             return (
//               <button
//                 key={inst.value}
//                 type="button"
//                 onClick={() => onInstitution(inst.value)}
//                 style={{
//                   padding: '8px 18px',
//                   borderRadius: 'var(--radius-full)',
//                   border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-rule-2)'}`,
//                   backgroundColor: active ? 'var(--color-accent-tint)' : 'transparent',
//                   color: active ? 'var(--color-accent)' : 'var(--color-ink-2)',
//                   fontSize: 13,
//                   fontWeight: active ? 600 : 400,
//                   cursor: 'pointer',
//                   transition: 'all 150ms',
//                 }}
//               >
//                 {inst.label}
//               </button>
//             )
//           })}
//         </div>
//       </div>
//     </>
//   )
// }

// // ─── Step 2B: WAEC/NECO learning style ───────────────────────────────────────

// const LEARNING_STYLES: { value: LearningStyle; label: string; description: string }[] = [
//   {
//     value: 'visual',
//     label: 'Visual',
//     description: 'Diagrams, charts, and colour-coded notes help you understand best.',
//   },
//   {
//     value: 'reading',
//     label: 'Reading',
//     description: 'You learn by reading textbooks and written summaries thoroughly.',
//   },
//   {
//     value: 'practice',
//     label: 'Practice-heavy',
//     description: 'You grasp concepts fastest by doing many past questions and exercises.',
//   },
//   {
//     value: 'mixed',
//     label: 'Mixed',
//     description: 'You use a combination of methods depending on the subject.',
//   },
// ]

// function Step2Waec({
//   value,
//   onChange,
// }: {
//   value: LearningStyle | null
//   onChange: (v: LearningStyle) => void
// }) {
//   return (
//     <>
//       <StepHeading
//         title="How do you learn best?"
//         sub="We will adjust your study material format to match your style."
//       />
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//         {LEARNING_STYLES.map((style) => {
//           const selected = value === style.value
//           return (
//             <button
//               key={style.value}
//               type="button"
//               onClick={() => onChange(style.value)}
//               style={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'flex-start',
//                 textAlign: 'left',
//                 padding: '14px 18px',
//                 borderRadius: 'var(--radius-md)',
//                 border: `1.5px solid ${selected ? 'var(--color-accent)' : 'var(--color-rule-2)'}`,
//                 backgroundColor: selected ? 'var(--color-accent-tint)' : 'var(--color-card)',
//                 cursor: 'pointer',
//                 transition: 'all 150ms',
//                 width: '100%',
//               }}
//             >
//               <span
//                 style={{
//                   fontSize: 15,
//                   fontWeight: 600,
//                   color: 'var(--color-ink)',
//                   marginBottom: 3,
//                 }}
//               >
//                 {style.label}
//               </span>
//               <span style={{ fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.4 }}>
//                 {style.description}
//               </span>
//             </button>
//           )
//         })}
//       </div>
//     </>
//   )
// }

// // ─── Step 3: Subjects ─────────────────────────────────────────────────────────

// function Step3({
//   subjects,
//   loading,
//   examTypes,
//   selected,
//   onChange,
// }: {
//   subjects: Subject[]
//   loading: boolean
//   examTypes: ExamType[]
//   selected: string[]
//   onChange: (slugs: string[]) => void
// }) {
//   const isJamb = examTypes.includes('jamb')
//   const { min: minRequired, max: maxAllowed } = getSubjectLimits(examTypes)

//   const toggle = (slug: string) => {
//     if (isJamb && slug === 'english') return // locked
//     if (selected.includes(slug)) {
//       // For JAMB English is always included so can't deselect
//       onChange(selected.filter((s) => s !== slug))
//     } else {
//       if (selected.length >= maxAllowed) return
//       onChange([...selected, slug])
//     }
//   }

//   const selectedCount = selected.length

//   return (
//     <>
//       <StepHeading
//         title="Select your subjects"
//         sub={
//           isJamb
//             ? `English is mandatory. Select up to ${maxAllowed} subjects in total (${selectedCount}/${maxAllowed} selected).`
//             : `Select between ${minRequired} and ${maxAllowed} subjects (${selectedCount}/${maxAllowed} selected).`
//         }
//       />
//       {loading ? (
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
//           {Array.from({ length: 8 }).map((_, i) => (
//             <div
//               key={i}
//               style={{
//                 height: 58,
//                 borderRadius: 'var(--radius-md)',
//                 backgroundColor: 'var(--color-paper-2)',
//                 animation: 'pulse 1.5s ease-in-out infinite',
//               }}
//             />
//           ))}
//         </div>
//       ) : (
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
//           {subjects.map((subject) => {
//             const isSelected = selected.includes(subject.slug)
//             const isLocked = isJamb && subject.slug === 'english'
//             const isDisabled = !isSelected && selected.length >= maxAllowed && !isLocked
//             const topicCount = subject.topics.length
//             const hue = getSubjectColor(subject)

//             return (
//               <button
//                 key={subject.slug}
//                 type="button"
//                 onClick={() => toggle(subject.slug)}
//                 disabled={isDisabled}
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 10,
//                   padding: '11px 14px',
//                   borderRadius: 'var(--radius-md)',
//                   border: `1.5px solid ${isSelected ? hue : 'var(--color-rule-2)'}`,
//                   backgroundColor: isSelected ? `${hue}14` : 'var(--color-card)',
//                   cursor: isDisabled ? 'not-allowed' : 'pointer',
//                   opacity: isDisabled ? 0.45 : 1,
//                   textAlign: 'left',
//                   transition: 'all 150ms',
//                   width: '100%',
//                   minWidth: 0,
//                 }}
//               >
//                 <div
//                   style={{
//                     width: 4,
//                     height: 32,
//                     borderRadius: 'var(--radius-full)',
//                     backgroundColor: hue,
//                     flexShrink: 0,
//                   }}
//                 />
//                 <div style={{ minWidth: 0 }}>
//                   <div
//                     style={{
//                       fontSize: 13,
//                       fontWeight: 600,
//                       color: 'var(--color-ink)',
//                       lineHeight: 1.3,
//                       whiteSpace: 'nowrap',
//                       overflow: 'hidden',
//                       textOverflow: 'ellipsis',
//                     }}
//                   >
//                     {subject.name}
//                     {isLocked && (
//                       <span
//                         style={{
//                           fontSize: 10,
//                           color: 'var(--color-ink-3)',
//                           fontWeight: 400,
//                           marginLeft: 4,
//                         }}
//                       >
//                         (required)
//                       </span>
//                     )}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: 11,
//                       color: 'var(--color-ink-3)',
//                       marginTop: 1,
//                     }}
//                   >
//                     {topicCount} topics
//                   </div>
//                 </div>
//               </button>
//             )
//           })}
//         </div>
//       )}
//     </>
//   )
// }

// // ─── Step 4: Strengths & Weaknesses ──────────────────────────────────────────

// function Step4({
//   subjects,
//   selectedSlugs,
//   strengths,
//   onChange,
// }: {
//   subjects: Subject[]
//   selectedSlugs: string[]
//   strengths: SubjectStrength[]
//   onChange: (strengths: SubjectStrength[]) => void
// }) {
//   const selectedSubjects = subjects.filter((s) => selectedSlugs.includes(s.slug))

//   const getLevel = (slug: string): StrengthLevel => {
//     return strengths.find((s) => s.subjectSlug === slug)?.level ?? 'average'
//   }

//   const setLevel = (slug: string, level: StrengthLevel) => {
//     const next = strengths.filter((s) => s.subjectSlug !== slug)
//     onChange([...next, { subjectSlug: slug, level }])
//   }

//   const LEVELS: { value: StrengthLevel; label: string; color: string }[] = [
//     { value: 'weak', label: 'Weak', color: 'var(--color-danger)' },
//     { value: 'average', label: 'Average', color: 'var(--color-ink-3)' },
//     { value: 'strong', label: 'Strong', color: 'var(--color-success)' },
//   ]

//   return (
//     <>
//       <StepHeading
//         title="Rate your confidence"
//         sub="Be honest — your roadmap allocates more time to subjects you find difficult."
//       />
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//         {selectedSubjects.map((subject) => {
//           const level = getLevel(subject.slug)
//           const hue = getSubjectColor(subject)
//           return (
//             <div
//               key={subject.slug}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'space-between',
//                 gap: 12,
//                 padding: '12px 16px',
//                 borderRadius: 'var(--radius-md)',
//                 border: '1px solid var(--color-rule)',
//                 backgroundColor: 'var(--color-card)',
//               }}
//             >
//               <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
//                 <div
//                   style={{
//                     width: 4,
//                     height: 28,
//                     borderRadius: 'var(--radius-full)',
//                     backgroundColor: hue,
//                     flexShrink: 0,
//                   }}
//                 />
//                 <span
//                   style={{
//                     fontSize: 13,
//                     fontWeight: 600,
//                     color: 'var(--color-ink)',
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis',
//                     whiteSpace: 'nowrap',
//                   }}
//                 >
//                   {subject.name}
//                 </span>
//               </div>
//               <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
//                 {LEVELS.map((lv) => {
//                   const active = level === lv.value
//                   return (
//                     <button
//                       key={lv.value}
//                       type="button"
//                       onClick={() => setLevel(subject.slug, lv.value)}
//                       style={{
//                         padding: '5px 10px',
//                         borderRadius: 'var(--radius-full)',
//                         border: `1.5px solid ${active ? lv.color : 'var(--color-rule-2)'}`,
//                         backgroundColor: active ? `${lv.color}18` : 'transparent',
//                         color: active ? lv.color : 'var(--color-ink-3)',
//                         fontSize: 12,
//                         fontWeight: active ? 600 : 400,
//                         cursor: 'pointer',
//                         transition: 'all 150ms',
//                       }}
//                     >
//                       {lv.label}
//                     </button>
//                   )
//                 })}
//               </div>
//             </div>
//           )
//         })}
//       </div>
//     </>
//   )
// }

// // ─── Step 5: Exam date ────────────────────────────────────────────────────────

// function Step5({
//   value,
//   onChange,
// }: {
//   value: string
//   onChange: (v: string) => void
// }) {
//   const t = useTranslations('onboarding')
//   const today = new Date()
//   const todayStr = today.toISOString().split('T')[0] ?? ''

//   const daysAway = value
//     ? differenceInDays(new Date(value), today)
//     : null
//   const weeksAway = daysAway !== null ? Math.round(daysAway / 7) : null

//   let feedbackColor = 'var(--color-ink-2)'
//   let feedbackMessage = ''

//   if (daysAway !== null) {
//     if (daysAway < 30) {
//       feedbackColor = 'var(--color-danger)'
//       feedbackMessage = 'Very tight. Focus only on the highest-weight topics.'
//     } else if (daysAway < 60) {
//       feedbackColor = 'var(--color-warning)'
//       feedbackMessage = 'Tight timeline. Consistent daily effort will be essential.'
//     } else if (daysAway <= 180) {
//       feedbackColor = 'var(--color-success)'
//       feedbackMessage = 'Good lead time. A steady pace will serve you well.'
//     } else {
//       feedbackColor = 'var(--color-ink-3)'
//       feedbackMessage = 'Plenty of time — a calm, consistent schedule will work.'
//     }
//   }

//   return (
//     <>
//       <StepHeading
//         title={t('examDate')}
//         sub="Your roadmap is built backwards from this date."
//       />
//       <div style={{ marginBottom: 20 }}>
//         <Input
//           type="date"
//           value={value}
//           min={todayStr}
//           onChange={(e) => onChange(e.target.value)}
//           style={{ fontSize: 16 }}
//         />
//       </div>
//       {daysAway !== null && daysAway > 0 && (
//         <div
//           style={{
//             padding: '14px 16px',
//             borderRadius: 'var(--radius-md)',
//             border: `1px solid ${feedbackColor}30`,
//             backgroundColor: `${feedbackColor}0D`,
//           }}
//         >
//           <p
//             style={{
//               fontFamily: 'var(--font-mono)',
//               fontSize: 13,
//               fontWeight: 600,
//               color: feedbackColor,
//               marginBottom: 4,
//             }}
//           >
//             {weeksAway} weeks away — {daysAway} days.
//           </p>
//           <p style={{ fontSize: 13, color: 'var(--color-ink-2)' }}>{feedbackMessage}</p>
//         </div>
//       )}
//       {daysAway !== null && daysAway <= 0 && (
//         <p style={{ fontSize: 13, color: 'var(--color-danger)' }}>
//           Please select a date in the future.
//         </p>
//       )}
//     </>
//   )
// }

// // ─── Step 6: Daily commitment ─────────────────────────────────────────────────

// function Step6({
//   minutes,
//   windows,
//   onMinutes,
//   onWindows,
// }: {
//   minutes: number
//   windows: StudyWindow[]
//   onMinutes: (v: number) => void
//   onWindows: (v: StudyWindow[]) => void
// }) {
//   const MIN = 30
//   const MAX = 360
//   const STEP = 15

//   const toggleWindow = (w: StudyWindow) => {
//     if (windows.includes(w)) {
//       onWindows(windows.filter((x) => x !== w))
//     } else {
//       onWindows([...windows, w])
//     }
//   }

//   return (
//     <>
//       <StepHeading
//         title="How much can you study each day?"
//         sub="Be realistic — a plan you stick to is better than an ambitious one you abandon."
//       />

//       {/* Numeric display */}
//       <div style={{ textAlign: 'center', marginBottom: 20 }}>
//         <span
//           style={{
//             fontFamily: 'var(--font-display)',
//             fontSize: 52,
//             lineHeight: 1,
//             color: 'var(--color-ink)',
//             letterSpacing: '-0.02em',
//           }}
//         >
//           {formatMinutes(minutes)}
//         </span>
//         <p style={{ fontSize: 13, color: 'var(--color-ink-3)', marginTop: 4 }}>
//           per day
//         </p>
//       </div>

//       {/* Slider */}
//       <div style={{ marginBottom: 32 }}>
//         <input
//           type="range"
//           min={MIN}
//           max={MAX}
//           step={STEP}
//           value={minutes}
//           onChange={(e) => onMinutes(Number(e.target.value))}
//           style={{
//             width: '100%',
//             accentColor: 'var(--color-accent)',
//             height: 6,
//             cursor: 'pointer',
//           }}
//         />
//         <div
//           style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             marginTop: 6,
//           }}
//         >
//           <span style={{ fontSize: 11, color: 'var(--color-ink-3)', fontFamily: 'var(--font-mono)' }}>
//             30 min
//           </span>
//           <span style={{ fontSize: 11, color: 'var(--color-ink-3)', fontFamily: 'var(--font-mono)' }}>
//             6 h
//           </span>
//         </div>
//       </div>

//       {/* Preferred windows */}
//       <div>
//         <label
//           style={{
//             display: 'block',
//             fontSize: 13,
//             fontWeight: 500,
//             color: 'var(--color-ink-2)',
//             marginBottom: 10,
//           }}
//         >
//           Preferred study times (select all that apply)
//         </label>
//         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
//           {STUDY_WINDOWS.map((w) => {
//             const active = windows.includes(w.value)
//             return (
//               <button
//                 key={w.value}
//                 type="button"
//                 onClick={() => toggleWindow(w.value)}
//                 style={{
//                   padding: '8px 14px',
//                   borderRadius: 'var(--radius-full)',
//                   border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-rule-2)'}`,
//                   backgroundColor: active ? 'var(--color-accent-tint)' : 'transparent',
//                   color: active ? 'var(--color-accent)' : 'var(--color-ink-2)',
//                   fontSize: 13,
//                   fontWeight: active ? 600 : 400,
//                   cursor: 'pointer',
//                   transition: 'all 150ms',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'center',
//                   gap: 2,
//                 }}
//               >
//                 <span>{w.label}</span>
//                 <span style={{ fontSize: 11, opacity: 0.7 }}>{w.time}</span>
//               </button>
//             )
//           })}
//         </div>
//       </div>
//     </>
//   )
// }

// // ─── Step 7: Generating ───────────────────────────────────────────────────────

// const GENERATING_STEPS = [
//   'Analysing your subjects and strength profile',
//   'Calculating your timeline and daily targets',
//   'Ordering topics by exam weight and prerequisites',
//   'Scheduling your spaced repetition calendar',
// ]

// function Step7Generating({
//   subjectCount,
//   topicCount,
//   weekCount,
// }: {
//   subjectCount: number
//   topicCount: number
//   weekCount: number
// }) {
//   const [ticked, setTicked] = useState(0)

//   useEffect(() => {
//     if (ticked >= GENERATING_STEPS.length) return
//     const t = setTimeout(() => setTicked((n) => n + 1), 600)
//     return () => clearTimeout(t)
//   }, [ticked])

//   return (
//     <div style={{ paddingTop: 24 }}>
//       <h1
//         style={{
//           fontFamily: 'var(--font-display)',
//           fontSize: 28,
//           lineHeight: 1.15,
//           letterSpacing: '-0.02em',
//           color: 'var(--color-ink)',
//           marginBottom: 10,
//         }}
//       >
//         Building your roadmap...
//       </h1>
//       <p style={{ fontSize: 14, color: 'var(--color-ink-2)', marginBottom: 32, lineHeight: 1.5 }}>
//         Mapping {topicCount} topics across {subjectCount} subjects over {weekCount} weeks.
//       </p>

//       <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//         {GENERATING_STEPS.map((label, i) => {
//           const done = i < ticked
//           const active = i === ticked
//           return (
//             <div
//               key={i}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 12,
//                 opacity: done || active ? 1 : 0.3,
//                 transition: 'opacity 400ms ease',
//               }}
//             >
//               <div
//                 style={{
//                   width: 24,
//                   height: 24,
//                   borderRadius: 'var(--radius-full)',
//                   border: `2px solid ${done ? 'var(--color-success)' : active ? 'var(--color-accent)' : 'var(--color-rule-2)'}`,
//                   backgroundColor: done ? 'var(--color-success)' : 'transparent',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   flexShrink: 0,
//                   transition: 'all 300ms',
//                 }}
//               >
//                 {done && <Check size={13} color="white" strokeWidth={2.5} />}
//                 {active && (
//                   <div
//                     style={{
//                       width: 8,
//                       height: 8,
//                       borderRadius: 'var(--radius-full)',
//                       backgroundColor: 'var(--color-accent)',
//                       animation: 'pulse 1s ease-in-out infinite',
//                     }}
//                   />
//                 )}
//               </div>
//               <span
//                 style={{
//                   fontSize: 14,
//                   color: done ? 'var(--color-ink)' : 'var(--color-ink-2)',
//                   fontWeight: done ? 500 : 400,
//                 }}
//               >
//                 {label}
//               </span>
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// // ─── Main Wizard ──────────────────────────────────────────────────────────────

// export default function OnboardingPage() {
//   const tCommon = useTranslations('common')
//   const router = useRouter()
//   const { toast } = useToast()
//   const setUser = useAuthStore((s) => s.setUser)

//   const [currentStep, setCurrentStep] = useState(1)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const [state, setState] = useState<WizardState>({
//     examType: null,
//     intendedCourse: '',
//     schoolName: '',
//     institutionType: null,
//     learningStyle: null,
//     subjectSlugs: [],
//     strengths: [],
//     examDate: '',
//     dailyStudyMinutes: 120,
//     preferredStudyWindows: ['morning'],
//   })

//   const { data: subjectsData, isLoading: subjectsLoading } = useSubjects()
//   const subjects = subjectsData ?? []

//   // Pre-select English when JAMB is among the selected exams
//   useEffect(() => {
//     if (state.examTypes.includes('jamb') && !state.subjectSlugs.includes('english')) {
//       setState((s) => ({ ...s, subjectSlugs: ['english', ...s.subjectSlugs.filter((x) => x !== 'english')] }))
//     }
//   }, [state.examTypes]) // eslint-disable-line react-hooks/exhaustive-deps

//   // Initialise strengths when subjects change
//   useEffect(() => {
//     const slugs = state.subjectSlugs
//     if (slugs.length === 0) return
//     const existing = new Set(state.strengths.map((s) => s.subjectSlug))
//     const missing = slugs.filter((s) => !existing.has(s))
//     if (missing.length > 0) {
//       setState((prev) => ({
//         ...prev,
//         strengths: [
//           ...prev.strengths,
//           ...missing.map((slug) => ({ subjectSlug: slug, level: 'average' as StrengthLevel })),
//         ],
//       }))
//     }
//   }, [state.subjectSlugs]) // eslint-disable-line react-hooks/exhaustive-deps

//   const totalWeeks = state.examDate
//     ? Math.max(1, Math.round(differenceInDays(new Date(state.examDate), new Date()) / 7))
//     : 0

//   const totalTopics = subjects
//     .filter((s) => state.subjectSlugs.includes(s.slug))
//     .reduce((sum, s) => sum + s.topics.length, 0)

//   // The user-visible step count is 6 (step 7 is the generating screen)
//   const VISIBLE_STEPS = 6

//   // Validation per step
//   const canProceed = useCallback((): boolean => {
//     switch (currentStep) {
//       case 1:
//         return state.examTypes.length > 0
//       case 2: {
//         const needsLearningStyle = state.examTypes.includes('waec') || state.examTypes.includes('neco')
//         return needsLearningStyle ? state.learningStyle !== null : true
//       }
//       case 3: {
//         const { min } = getSubjectLimits(state.examTypes)
//         return state.subjectSlugs.length >= min
//       }
//       case 4:
//         return true // always valid — defaults to average
//       case 5:
//         return state.examDate !== '' && differenceInDays(new Date(state.examDate), new Date()) > 0
//       case 6:
//         return state.preferredStudyWindows.length > 0
//       default:
//         return true
//     }
//   }, [currentStep, state])

//   // API call per step
//   const persistStep = useCallback(async (step: number): Promise<boolean> => {
//     try {
//       switch (step) {
//         case 1:
//           // NOTE: backend /onboarding/step/1 must accept `examTypes` as an
//           // array now instead of a single `examType` string — confirm this
//           // with backend before shipping.
//           await api.post('/onboarding/step/1', { examTypes: state.examTypes })
//           break
//         case 2: {
//           const isJamb = state.examTypes.includes('jamb')
//           const needsLearningStyle = state.examTypes.includes('waec') || state.examTypes.includes('neco')
//           const calls: Promise<unknown>[] = []
//           if (isJamb) {
//             calls.push(
//               api.post('/onboarding/step/2/jamb', {
//                 intendedCourse: state.intendedCourse || undefined,
//                 institutionType: state.institutionType || undefined,
//               }),
//             )
//           }
//           if (needsLearningStyle) {
//             calls.push(
//               api.post('/onboarding/step/2/waec', {
//                 learningStyle: state.learningStyle,
//               }),
//             )
//           }
//           await Promise.all(calls)
//           break
//         }
//         case 3:
//           await api.post('/onboarding/step/3', { subjectSlugs: state.subjectSlugs })
//           break
//         case 4:
//           await api.post('/onboarding/step/4', { strengths: state.strengths })
//           break
//         case 5: {
//           // Convert date string to ISO datetime
//           const dateObj = new Date(state.examDate)
//           dateObj.setUTCHours(12, 0, 0, 0)
//           await api.post('/onboarding/step/5', { examDate: dateObj.toISOString() })
//           break
//         }
//         case 6:
//           await api.post('/onboarding/step/6', {
//             dailyStudyMinutes: state.dailyStudyMinutes,
//             preferredStudyWindows: state.preferredStudyWindows,
//           })
//           break
//       }
//       return true
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Something went wrong'
//       toast({
//         title: 'Could not save progress',
//         description: message,
//         variant: 'danger',
//       })
//       return false
//     }
//   }, [state, toast])

//   const handleContinue = async () => {
//     if (!canProceed()) return
//     setIsSubmitting(true)

//     const saved = await persistStep(currentStep)
//     setIsSubmitting(false)

//     if (!saved) return // error toast shown inside persistStep

//     if (currentStep === 6) {
//       // Move to generating screen then complete
//       setCurrentStep(7)
//       try {
//         const result = await api.post<{
//           data: {
//             user: {
//               id: string
//               name: string
//               email: string
//               plan: 'free' | 'scholar'
//               onboardingCompleted: boolean
//               onboardingStep: number
//               theme: 'system' | 'light' | 'dark'
//               timezone: string
//               avatarUrl?: string
//             }
//           }
//         }>('/onboarding/complete')
//         setUser(result.data.user)
//       } catch (err) {
//         const message = err instanceof Error ? err.message : 'Failed to complete onboarding'
//         toast({ title: 'Roadmap generation failed', description: message, variant: 'danger' })
//       }
//       // Wait for all the checklist ticks (4 * 600ms + buffer) then redirect
//       setTimeout(() => {
//         router.push('/dashboard')
//       }, 3200)
//       return
//     }

//     setCurrentStep((s) => s + 1)
//   }

//   const handleBack = () => {
//     if (currentStep <= 1) return
//     setCurrentStep((s) => s - 1)
//   }

//   // Render
//   return (
//     <div style={{ width: '100%', maxWidth: 540 }}>
//       {currentStep <= VISIBLE_STEPS && (
//         <ProgressBar step={currentStep} total={VISIBLE_STEPS} />
//       )}

//       {/* Step content */}
//       {currentStep === 1 && (
//         <Step1
//           value={state.examTypes}
//           onChange={(v) => setState((s) => ({ ...s, examTypes: v }))}
//         />
//       )}

//       {currentStep === 2 && (
//         <>
//           {state.examTypes.includes('jamb') && (
//             <Step2Jamb
//               schoolName={state.schoolName}
//               institutionType={state.institutionType}
//               onSchoolName={(v) => setState((s) => ({ ...s, schoolName: v }))}
//               onInstitution={(v) => setState((s) => ({ ...s, institutionType: v }))}
//             />
//           )}

//           {state.examTypes.includes('jamb') &&
//             (state.examTypes.includes('waec') || state.examTypes.includes('neco')) && (
//               <div style={{ height: 1, backgroundColor: 'var(--color-rule)', margin: '32px 0' }} />
//             )}

//           {(state.examTypes.includes('waec') || state.examTypes.includes('neco')) && (
//             <Step2Waec
//               value={state.learningStyle}
//               onChange={(v) => setState((s) => ({ ...s, learningStyle: v }))}
//             />
//           )}
//         </>
//       )}

//       {currentStep === 3 && (
//         <Step3
//           subjects={subjects}
//           loading={subjectsLoading}
//           examTypes={state.examTypes}
//           selected={state.subjectSlugs}
//           onChange={(slugs) => setState((s) => ({ ...s, subjectSlugs: slugs }))}
//         />
//       )}

//       {currentStep === 4 && (
//         <Step4
//           subjects={subjects}
//           selectedSlugs={state.subjectSlugs}
//           strengths={state.strengths}
//           onChange={(strengths) => setState((s) => ({ ...s, strengths }))}
//         />
//       )}

//       {currentStep === 5 && (
//         <Step5
//           value={state.examDate}
//           onChange={(v) => setState((s) => ({ ...s, examDate: v }))}
//         />
//       )}

//       {currentStep === 6 && (
//         <Step6
//           minutes={state.dailyStudyMinutes}
//           windows={state.preferredStudyWindows}
//           onMinutes={(v) => setState((s) => ({ ...s, dailyStudyMinutes: v }))}
//           onWindows={(v) => setState((s) => ({ ...s, preferredStudyWindows: v }))}
//         />
//       )}

//       {currentStep === 7 && (
//         <Step7Generating
//           subjectCount={state.subjectSlugs.length}
//           topicCount={totalTopics}
//           weekCount={totalWeeks}
//         />
//       )}

//       {/* Navigation */}
//       {currentStep <= VISIBLE_STEPS && (
//         <div
//           style={{
//             display: 'flex',
//             flexDirection: 'column',
//             gap: 12,
//             marginTop: 36,
//           }}
//         >
//           <Button
//             variant="accent"
//             size="lg"
//             onClick={handleContinue}
//             disabled={!canProceed() || isSubmitting}
//             style={{ width: '100%' }}
//           >
//             {isSubmitting
//               ? 'Saving...'
//               : currentStep === VISIBLE_STEPS
//               ? 'Build my roadmap'
//               : tCommon('continue')}
//           </Button>

//           {currentStep > 1 && (
//             <Button
//               variant="ghost"
//               size="default"
//               onClick={handleBack}
//               disabled={isSubmitting}
//               style={{ width: '100%' }}
//             >
//               {tCommon('back')}
//             </Button>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }



'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { differenceInDays, differenceInWeeks } from 'date-fns'
import { Check, Trophy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { useSubjects } from '@/lib/hooks/use-subjects'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils/cn'
import type { Subject } from '@propella/shared'

// ─── Types ─────────────────────────────────────────────────────────────────

type ExamType = 'jamb' | 'waec' | 'neco'
type LearningStyle = 'visual' | 'reading' | 'practice' | 'mixed'
type StudyWindow = 'early-morning' | 'morning' | 'afternoon' | 'evening'
type StrengthLevel = 'weak' | 'average' | 'strong'

interface SubjectStrength {
  subjectSlug: string
  level: StrengthLevel
}

interface WizardState {
  examTypes: ExamType[]
  intendedCourse: string
  schoolName: string
  institutionType: 'university' | 'polytechnic' | 'college' | null
  learningStyle: LearningStyle | null
  subjectSlugs: string[]
  strengths: SubjectStrength[]
  examDate: string
  dailyStudyMinutes: number
  preferredStudyWindows: StudyWindow[]
}

// ─── Constants ──────────────────────────────────────────────────────────────

const COMMON_COURSES = [
  'Medicine and Surgery',
  'Law',
  'Engineering (Electrical)',
  'Engineering (Civil)',
  'Engineering (Mechanical)',
  'Computer Science',
  'Pharmacy',
  'Accounting',
  'Economics',
  'Mass Communication',
  'Architecture',
  'Business Administration',
  'Nursing',
  'Agricultural Science',
  'Political Science',
  'English Language',
  'Mathematics',
  'Chemistry',
  'Physics',
  'Biology',
]

const STUDY_WINDOWS: { value: StudyWindow; label: string; time: string }[] = [
  { value: 'early-morning', label: 'Early Morning', time: '5am – 8am' },
  { value: 'morning', label: 'Morning', time: '8am – 12pm' },
  { value: 'afternoon', label: 'Afternoon', time: '12pm – 5pm' },
  { value: 'evening', label: 'Evening', time: '5pm – 10pm' },
]

interface Institution {
  name: string
  type: 'university' | 'polytechnic' | 'college'
}

// Common Nigerian tertiary institutions, used to power the searchable
// school picker in Step 2 (JAMB path). Not exhaustive — the input still
// allows free text for schools not in this list.
const NIGERIAN_INSTITUTIONS: Institution[] = [
  // Federal universities
  { name: 'University of Lagos (UNILAG)', type: 'university' },
  { name: 'University of Ibadan (UI)', type: 'university' },
  { name: 'University of Nigeria, Nsukka (UNN)', type: 'university' },
  { name: 'Obafemi Awolowo University (OAU)', type: 'university' },
  { name: 'Ahmadu Bello University (ABU)', type: 'university' },
  { name: 'University of Benin (UNIBEN)', type: 'university' },
  { name: 'University of Ilorin (UNILORIN)', type: 'university' },
  { name: 'University of Port Harcourt (UNIPORT)', type: 'university' },
  { name: 'Bayero University Kano (BUK)', type: 'university' },
  { name: 'University of Jos (UNIJOS)', type: 'university' },
  { name: 'University of Calabar (UNICAL)', type: 'university' },
  { name: 'University of Maiduguri (UNIMAID)', type: 'university' },
  { name: 'Federal University of Technology, Akure (FUTA)', type: 'university' },
  { name: 'Federal University of Technology, Minna (FUTMINNA)', type: 'university' },
  { name: 'Federal University of Technology, Owerri (FUTO)', type: 'university' },
  { name: 'Usmanu Danfodiyo University, Sokoto (UDUSOK)', type: 'university' },
  { name: 'Nnamdi Azikiwe University (UNIZIK)', type: 'university' },
  { name: 'Federal University Oye-Ekiti (FUOYE)', type: 'university' },
  { name: 'Federal University Dutsin-Ma (FUDMA)', type: 'university' },
  { name: 'Modibbo Adama University, Yola (MAU)', type: 'university' },
  { name: 'Federal University, Lokoja (FUL)', type: 'university' },
  { name: 'Federal University, Lafia (FULafia)', type: 'university' },
  { name: 'Federal University, Gusau (FUGUS)', type: 'university' },
  { name: 'Federal University, Gashua (FUGASHUA)', type: 'university' },
  { name: 'Nigerian Defence Academy (NDA)', type: 'university' },
  // State universities
  { name: 'Lagos State University (LASU)', type: 'university' },
  { name: 'Ladoke Akintola University of Technology (LAUTECH)', type: 'university' },
  { name: 'Rivers State University (RSU)', type: 'university' },
  { name: 'Kano University of Science and Technology, Wudil (KUST)', type: 'university' },
  { name: 'Ekiti State University (EKSU)', type: 'university' },
  { name: 'Delta State University, Abraka (DELSU)', type: 'university' },
  { name: 'Imo State University (IMSU)', type: 'university' },
  { name: 'Kaduna State University (KASU)', type: 'university' },
  { name: 'Benue State University (BSU)', type: 'university' },
  { name: 'Plateau State University, Bokkos (PLASU)', type: 'university' },
  { name: 'Ondo State University of Science and Technology (OSUSTECH)', type: 'university' },
  { name: 'Niger Delta University (NDU)', type: 'university' },
  { name: 'Adamawa State University (ADSU)', type: 'university' },
  { name: 'Enugu State University of Science and Technology (ESUT)', type: 'university' },
  { name: 'Kogi State University (KSU)', type: 'university' },
  { name: 'Abia State University (ABSU)', type: 'university' },
  // Private universities
  { name: 'Covenant University', type: 'university' },
  { name: 'Babcock University', type: 'university' },
  { name: 'Afe Babalola University (ABUAD)', type: 'university' },
  { name: 'Pan-Atlantic University', type: 'university' },
  { name: 'American University of Nigeria (AUN)', type: 'university' },
  { name: 'Bowen University', type: 'university' },
  { name: 'Bells University of Technology', type: 'university' },
  { name: 'Redeemer\u2019s University', type: 'university' },
  { name: 'Landmark University', type: 'university' },
  { name: 'Caleb University', type: 'university' },
  { name: 'Lead City University', type: 'university' },
  // Federal polytechnics
  { name: 'Yaba College of Technology (YABATECH)', type: 'polytechnic' },
  { name: 'Federal Polytechnic, Nekede', type: 'polytechnic' },
  { name: 'Federal Polytechnic, Ede', type: 'polytechnic' },
  { name: 'Federal Polytechnic, Bida', type: 'polytechnic' },
  { name: 'Federal Polytechnic, Ilaro', type: 'polytechnic' },
  { name: 'Federal Polytechnic, Offa', type: 'polytechnic' },
  { name: 'Federal Polytechnic, Oko', type: 'polytechnic' },
  { name: 'Federal Polytechnic, Damaturu', type: 'polytechnic' },
  { name: 'Auchi Polytechnic', type: 'polytechnic' },
  { name: 'Kaduna Polytechnic', type: 'polytechnic' },
  { name: 'Federal Polytechnic, Bauchi', type: 'polytechnic' },
  { name: 'Federal Polytechnic, Mubi', type: 'polytechnic' },
  // State polytechnics
  { name: 'Lagos State Polytechnic (LASPOTECH)', type: 'polytechnic' },
  { name: 'Kano State Polytechnic', type: 'polytechnic' },
  { name: 'Rivers State Polytechnic (RIVPOLY)', type: 'polytechnic' },
  { name: 'Delta State Polytechnic, Ogwashi-Uku', type: 'polytechnic' },
  { name: 'Plateau State Polytechnic, Barkin Ladi', type: 'polytechnic' },
  { name: 'Akanu Ibiam Federal Polytechnic, Unwana', type: 'polytechnic' },
  // Colleges of education
  { name: 'Federal College of Education, Zaria', type: 'college' },
  { name: 'Federal College of Education (Technical), Akoka', type: 'college' },
  { name: 'Adeyemi Federal University of Education, Ondo', type: 'college' },
  { name: 'Alvan Ikoku Federal College of Education', type: 'college' },
  { name: 'Federal College of Education, Kano', type: 'college' },
  { name: 'Federal College of Education, Pankshin', type: 'college' },
  { name: 'College of Education, Warri', type: 'college' },
  { name: 'Kwara State College of Education, Ilorin', type: 'college' },
]

const INSTITUTION_TYPE_LABELS: Record<Institution['type'], string> = {
  university: 'University',
  polytechnic: 'Polytechnic',
  college: 'College of Education',
}

// ─── Helper: format minutes ──────────────────────────────────────────────────

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

// ─── Helper: subject hue ─────────────────────────────────────────────────────

function getSubjectColor(subject: Subject): string {
  return subject.hue
}

// ─── Helper: subject count rules for a set of selected exams ────────────────
// JAMB alone requires exactly 4 (English + 3). WAEC/NECO require 8–9.
// When JAMB is combined with WAEC/NECO we use the wider 8–9 range, since it
// comfortably covers JAMB's smaller requirement and English stays locked in.

function getSubjectLimits(examTypes: ExamType[]): { min: number; max: number } {
  const hasJamb = examTypes.includes('jamb')
  const hasWaecOrNeco = examTypes.includes('waec') || examTypes.includes('neco')

  if (hasWaecOrNeco) return { min: 8, max: 9 }
  if (hasJamb) return { min: 4, max: 4 }
  return { min: 8, max: 9 }
}

// ─── Progress bar ────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100)
  return (
    <div style={{ marginBottom: 32 }}>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: 'var(--color-ink-3)',
          marginBottom: 8,
        }}
      >
        Step {step} of {total}
      </p>
      <div
        style={{
          height: 2,
          backgroundColor: 'var(--color-rule)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: 'var(--color-accent)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 400ms ease',
          }}
        />
      </div>
    </div>
  )
}

// ─── Step heading ─────────────────────────────────────────────────────────────

function StepHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          color: 'var(--color-ink)',
          marginBottom: sub ? 8 : 0,
        }}
      >
        {title}
      </h1>
      {sub && (
        <p
          style={{
            fontSize: 14,
            color: 'var(--color-ink-2)',
            lineHeight: 1.5,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  )
}

// ─── Step 1: Choose exam ──────────────────────────────────────────────────────

const EXAMS: { value: ExamType; name: string; description: string }[] = [
  {
    value: 'jamb',
    name: 'JAMB / UTME',
    description: 'Unified Tertiary Matriculation Examination — for university, polytechnic, and college of education entry.',
  },
  {
    value: 'waec',
    name: 'WAEC',
    description: 'West African Senior School Certificate — widely accepted for employment and further education.',
  },
  {
    value: 'neco',
    name: 'NECO',
    description: 'National Examinations Council — national secondary school leaving certificate.',
  },
]

function Step1({
  value,
  onChange,
}: {
  value: ExamType[]
  onChange: (v: ExamType[]) => void
}) {
  const t = useTranslations('onboarding')

  const toggle = (exam: ExamType) => {
    if (value.includes(exam)) {
      onChange(value.filter((v) => v !== exam))
    } else {
      onChange([...value, exam])
    }
  }

  return (
    <>
      <StepHeading
        title={t('examType')}
        sub="Select every exam you're preparing for — we will tailor your roadmap to each syllabus and marking scheme."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {EXAMS.map((exam) => {
          const selected = value.includes(exam.value)
          return (
            <button
              key={exam.value}
              type="button"
              onClick={() => toggle(exam.value)}
              aria-pressed={selected}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                textAlign: 'left',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${selected ? 'var(--color-accent)' : 'var(--color-rule-2)'}`,
                backgroundColor: selected ? 'var(--color-accent-tint)' : 'var(--color-card)',
                cursor: 'pointer',
                transition: 'border-color 150ms, background-color 150ms',
                width: '100%',
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  border: `1.5px solid ${selected ? 'var(--color-accent)' : 'var(--color-rule-2)'}`,
                  backgroundColor: selected ? 'var(--color-accent)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                  transition: 'all 150ms',
                }}
              >
                {selected && <Check size={13} color="white" strokeWidth={2.5} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    color: 'var(--color-ink)',
                    fontWeight: selected ? 600 : 400,
                    marginBottom: 4,
                  }}
                >
                  {exam.name}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--color-ink-2)',
                    lineHeight: 1.5,
                  }}
                >
                  {exam.description}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}

// ─── Step 2A: JAMB course path ────────────────────────────────────────────────

function Step2Jamb({
  schoolName,
  institutionType,
  onSchoolName,
  onInstitution,
}: {
  schoolName: string
  institutionType: 'university' | 'polytechnic' | 'college' | null
  onSchoolName: (v: string) => void
  onInstitution: (v: 'university' | 'polytechnic' | 'college' | null) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState(schoolName)

  // Keep local query text in sync if parent state changes externally
  useEffect(() => {
    setQuery(schoolName)
  }, [schoolName])

  const filtered =
    query.trim().length === 0
      ? NIGERIAN_INSTITUTIONS
      : NIGERIAN_INSTITUTIONS.filter((inst) =>
          inst.name.toLowerCase().includes(query.trim().toLowerCase()),
        )

  const handleSelect = (inst: Institution) => {
    setQuery(inst.name)
    onSchoolName(inst.name)
    onInstitution(inst.type)
    setIsOpen(false)
  }

  const handleInputChange = (v: string) => {
    setQuery(v)
    onSchoolName(v)
    // Typed value no longer matches a known institution exactly, so clear
    // any auto-detected type until the person picks from the list again.
    const exactMatch = NIGERIAN_INSTITUTIONS.find(
      (inst) => inst.name.toLowerCase() === v.trim().toLowerCase(),
    )
    onInstitution(exactMatch ? exactMatch.type : null)
    setIsOpen(true)
  }

  return (
    <>
      <StepHeading
        title="Where are you headed?"
        sub="Search for your school of choice in Nigeria — university, polytechnic, or college of education."
      />
      <div style={{ marginBottom: 20, position: 'relative' }}>
        <label
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-ink-2)',
            marginBottom: 6,
          }}
        >
          School of choice
        </label>
        <Input
          type="text"
          placeholder="e.g. University of Lagos, UNILAG, or your institution name"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 120)}
        />

        {institutionType && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              marginTop: 8,
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-accent-tint)',
              color: 'var(--color-accent)',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {INSTITUTION_TYPE_LABELS[institutionType]}
          </span>
        )}

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 6,
              maxHeight: 260,
              overflowY: 'auto',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-rule-2)',
              backgroundColor: 'var(--color-card)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 20,
            }}
          >
            {filtered.length === 0 ? (
              <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-ink-3)' }}>
                No match found — you can type your institution's name directly.
              </div>
            ) : (
              filtered.slice(0, 30).map((inst) => (
                <button
                  key={inst.name}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelect(inst)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 13.5,
                    color: 'var(--color-ink)',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inst.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--color-ink-3)',
                      flexShrink: 0,
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {INSTITUTION_TYPE_LABELS[inst.type]}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Leaderboard teaser — nudges competitiveness early in onboarding */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '14px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-rule)',
          backgroundColor: 'var(--color-paper-2)',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-accent-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Trophy size={16} color="var(--color-accent)" strokeWidth={2} />
        </div>
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-ink)',
              marginBottom: 2,
            }}
          >
            Climb the leaderboard
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--color-ink-2)', lineHeight: 1.5 }}>
            Top-performing students nationwide get featured on our global leaderboard.
            Stay consistent and see how you stack up against the best.
          </p>
        </div>
      </div>
    </>
  )
}

// ─── Step 2B: WAEC/NECO learning style ───────────────────────────────────────

const LEARNING_STYLES: { value: LearningStyle; label: string; description: string }[] = [
  {
    value: 'visual',
    label: 'Visual',
    description: 'Diagrams, charts, and colour-coded notes help you understand best.',
  },
  {
    value: 'reading',
    label: 'Reading',
    description: 'You learn by reading textbooks and written summaries thoroughly.',
  },
  {
    value: 'practice',
    label: 'Practice-heavy',
    description: 'You grasp concepts fastest by doing many past questions and exercises.',
  },
  {
    value: 'mixed',
    label: 'Mixed',
    description: 'You use a combination of methods depending on the subject.',
  },
]

function Step2Waec({
  value,
  onChange,
}: {
  value: LearningStyle | null
  onChange: (v: LearningStyle) => void
}) {
  return (
    <>
      <StepHeading
        title="How do you learn best?"
        sub="We will adjust your study material format to match your style."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {LEARNING_STYLES.map((style) => {
          const selected = value === style.value
          return (
            <button
              key={style.value}
              type="button"
              onClick={() => onChange(style.value)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${selected ? 'var(--color-accent)' : 'var(--color-rule-2)'}`,
                backgroundColor: selected ? 'var(--color-accent-tint)' : 'var(--color-card)',
                cursor: 'pointer',
                transition: 'all 150ms',
                width: '100%',
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  marginBottom: 3,
                }}
              >
                {style.label}
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.4 }}>
                {style.description}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}

// ─── Step 3: Subjects ─────────────────────────────────────────────────────────

function Step3({
  subjects,
  loading,
  examTypes,
  selected,
  onChange,
}: {
  subjects: Subject[]
  loading: boolean
  examTypes: ExamType[]
  selected: string[]
  onChange: (slugs: string[]) => void
}) {
  const isJamb = examTypes.includes('jamb')
  const { min: minRequired, max: maxAllowed } = getSubjectLimits(examTypes)

  const toggle = (slug: string) => {
    if (isJamb && slug === 'english') return // locked
    if (selected.includes(slug)) {
      // For JAMB English is always included so can't deselect
      onChange(selected.filter((s) => s !== slug))
    } else {
      if (selected.length >= maxAllowed) return
      onChange([...selected, slug])
    }
  }

  const selectedCount = selected.length

  return (
    <>
      <StepHeading
        title="Select your subjects"
        sub={
          isJamb
            ? `English is mandatory. Select up to ${maxAllowed} subjects in total (${selectedCount}/${maxAllowed} selected).`
            : `Select between ${minRequired} and ${maxAllowed} subjects (${selectedCount}/${maxAllowed} selected).`
        }
      />
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 58,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-paper-2)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {subjects.map((subject) => {
            const isSelected = selected.includes(subject.slug)
            const isLocked = isJamb && subject.slug === 'english'
            const isDisabled = !isSelected && selected.length >= maxAllowed && !isLocked
            const topicCount = subject.topics.length
            const hue = getSubjectColor(subject)

            return (
              <button
                key={subject.slug}
                type="button"
                onClick={() => toggle(subject.slug)}
                disabled={isDisabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${isSelected ? hue : 'var(--color-rule-2)'}`,
                  backgroundColor: isSelected ? `${hue}14` : 'var(--color-card)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.45 : 1,
                  textAlign: 'left',
                  transition: 'all 150ms',
                  width: '100%',
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 32,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: hue,
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--color-ink)',
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {subject.name}
                    {isLocked && (
                      <span
                        style={{
                          fontSize: 10,
                          color: 'var(--color-ink-3)',
                          fontWeight: 400,
                          marginLeft: 4,
                        }}
                      >
                        (required)
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--color-ink-3)',
                      marginTop: 1,
                    }}
                  >
                    {topicCount} topics
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

// ─── Step 4: Strengths & Weaknesses ──────────────────────────────────────────

function Step4({
  subjects,
  selectedSlugs,
  strengths,
  onChange,
}: {
  subjects: Subject[]
  selectedSlugs: string[]
  strengths: SubjectStrength[]
  onChange: (strengths: SubjectStrength[]) => void
}) {
  const selectedSubjects = subjects.filter((s) => selectedSlugs.includes(s.slug))

  const getLevel = (slug: string): StrengthLevel => {
    return strengths.find((s) => s.subjectSlug === slug)?.level ?? 'average'
  }

  const setLevel = (slug: string, level: StrengthLevel) => {
    const next = strengths.filter((s) => s.subjectSlug !== slug)
    onChange([...next, { subjectSlug: slug, level }])
  }

  const LEVELS: { value: StrengthLevel; label: string; color: string }[] = [
    { value: 'weak', label: 'Weak', color: 'var(--color-danger)' },
    { value: 'average', label: 'Average', color: 'var(--color-ink-3)' },
    { value: 'strong', label: 'Strong', color: 'var(--color-success)' },
  ]

  return (
    <>
      <StepHeading
        title="Rate your confidence"
        sub="Be honest — your roadmap allocates more time to subjects you find difficult."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {selectedSubjects.map((subject) => {
          const level = getLevel(subject.slug)
          const hue = getSubjectColor(subject)
          return (
            <div
              key={subject.slug}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-rule)',
                backgroundColor: 'var(--color-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div
                  style={{
                    width: 4,
                    height: 28,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: hue,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-ink)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {subject.name}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {LEVELS.map((lv) => {
                  const active = level === lv.value
                  return (
                    <button
                      key={lv.value}
                      type="button"
                      onClick={() => setLevel(subject.slug, lv.value)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-full)',
                        border: `1.5px solid ${active ? lv.color : 'var(--color-rule-2)'}`,
                        backgroundColor: active ? `${lv.color}18` : 'transparent',
                        color: active ? lv.color : 'var(--color-ink-3)',
                        fontSize: 12,
                        fontWeight: active ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 150ms',
                      }}
                    >
                      {lv.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ─── Step 5: Exam date ────────────────────────────────────────────────────────

function Step5({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const t = useTranslations('onboarding')
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0] ?? ''

  const daysAway = value
    ? differenceInDays(new Date(value), today)
    : null
  const weeksAway = daysAway !== null ? Math.round(daysAway / 7) : null

  let feedbackColor = 'var(--color-ink-2)'
  let feedbackMessage = ''

  if (daysAway !== null) {
    if (daysAway < 30) {
      feedbackColor = 'var(--color-danger)'
      feedbackMessage = 'Very tight. Focus only on the highest-weight topics.'
    } else if (daysAway < 60) {
      feedbackColor = 'var(--color-warning)'
      feedbackMessage = 'Tight timeline. Consistent daily effort will be essential.'
    } else if (daysAway <= 180) {
      feedbackColor = 'var(--color-success)'
      feedbackMessage = 'Good lead time. A steady pace will serve you well.'
    } else {
      feedbackColor = 'var(--color-ink-3)'
      feedbackMessage = 'Plenty of time — a calm, consistent schedule will work.'
    }
  }

  return (
    <>
      <StepHeading
        title={t('examDate')}
        sub="Your roadmap is built backwards from this date."
      />
      <div style={{ marginBottom: 20 }}>
        <Input
          type="date"
          value={value}
          min={todayStr}
          onChange={(e) => onChange(e.target.value)}
          style={{ fontSize: 16 }}
        />
      </div>
      {daysAway !== null && daysAway > 0 && (
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${feedbackColor}30`,
            backgroundColor: `${feedbackColor}0D`,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              fontWeight: 600,
              color: feedbackColor,
              marginBottom: 4,
            }}
          >
            {weeksAway} weeks away — {daysAway} days.
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-ink-2)' }}>{feedbackMessage}</p>
        </div>
      )}
      {daysAway !== null && daysAway <= 0 && (
        <p style={{ fontSize: 13, color: 'var(--color-danger)' }}>
          Please select a date in the future.
        </p>
      )}
    </>
  )
}

// ─── Step 6: Daily commitment ─────────────────────────────────────────────────

function Step6({
  minutes,
  windows,
  onMinutes,
  onWindows,
}: {
  minutes: number
  windows: StudyWindow[]
  onMinutes: (v: number) => void
  onWindows: (v: StudyWindow[]) => void
}) {
  const MIN = 30
  const MAX = 360
  const STEP = 15

  const toggleWindow = (w: StudyWindow) => {
    if (windows.includes(w)) {
      onWindows(windows.filter((x) => x !== w))
    } else {
      onWindows([...windows, w])
    }
  }

  return (
    <>
      <StepHeading
        title="How much can you study each day?"
        sub="Be realistic — a plan you stick to is better than an ambitious one you abandon."
      />

      {/* Numeric display */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 52,
            lineHeight: 1,
            color: 'var(--color-ink)',
            letterSpacing: '-0.02em',
          }}
        >
          {formatMinutes(minutes)}
        </span>
        <p style={{ fontSize: 13, color: 'var(--color-ink-3)', marginTop: 4 }}>
          per day
        </p>
      </div>

      {/* Slider */}
      <div style={{ marginBottom: 32 }}>
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={minutes}
          onChange={(e) => onMinutes(Number(e.target.value))}
          style={{
            width: '100%',
            accentColor: 'var(--color-accent)',
            height: 6,
            cursor: 'pointer',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 6,
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--color-ink-3)', fontFamily: 'var(--font-mono)' }}>
            30 min
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-ink-3)', fontFamily: 'var(--font-mono)' }}>
            6 h
          </span>
        </div>
      </div>

      {/* Preferred windows */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-ink-2)',
            marginBottom: 10,
          }}
        >
          Preferred study times (select all that apply)
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {STUDY_WINDOWS.map((w) => {
            const active = windows.includes(w.value)
            return (
              <button
                key={w.value}
                type="button"
                onClick={() => toggleWindow(w.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-rule-2)'}`,
                  backgroundColor: active ? 'var(--color-accent-tint)' : 'transparent',
                  color: active ? 'var(--color-accent)' : 'var(--color-ink-2)',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <span>{w.label}</span>
                <span style={{ fontSize: 11, opacity: 0.7 }}>{w.time}</span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ─── Step 7: Generating ───────────────────────────────────────────────────────

const GENERATING_STEPS = [
  'Analysing your subjects and strength profile',
  'Calculating your timeline and daily targets',
  'Ordering topics by exam weight and prerequisites',
  'Scheduling your spaced repetition calendar',
]

function Step7Generating({
  subjectCount,
  topicCount,
  weekCount,
}: {
  subjectCount: number
  topicCount: number
  weekCount: number
}) {
  const [ticked, setTicked] = useState(0)

  useEffect(() => {
    if (ticked >= GENERATING_STEPS.length) return
    const t = setTimeout(() => setTicked((n) => n + 1), 600)
    return () => clearTimeout(t)
  }, [ticked])

  return (
    <div style={{ paddingTop: 24 }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          color: 'var(--color-ink)',
          marginBottom: 10,
        }}
      >
        Building your roadmap...
      </h1>
      <p style={{ fontSize: 14, color: 'var(--color-ink-2)', marginBottom: 32, lineHeight: 1.5 }}>
        Mapping {topicCount} topics across {subjectCount} subjects over {weekCount} weeks.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {GENERATING_STEPS.map((label, i) => {
          const done = i < ticked
          const active = i === ticked
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: done || active ? 1 : 0.3,
                transition: 'opacity 400ms ease',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 'var(--radius-full)',
                  border: `2px solid ${done ? 'var(--color-success)' : active ? 'var(--color-accent)' : 'var(--color-rule-2)'}`,
                  backgroundColor: done ? 'var(--color-success)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 300ms',
                }}
              >
                {done && <Check size={13} color="white" strokeWidth={2.5} />}
                {active && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-accent)',
                      animation: 'pulse 1s ease-in-out infinite',
                    }}
                  />
                )}
              </div>
              <span
                style={{
                  fontSize: 14,
                  color: done ? 'var(--color-ink)' : 'var(--color-ink-2)',
                  fontWeight: done ? 500 : 400,
                }}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { toast } = useToast()
  const setUser = useAuthStore((s) => s.setUser)

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [state, setState] = useState<WizardState>({
    examTypes: [],
    intendedCourse: '',
    schoolName: '',
    institutionType: null,
    learningStyle: null,
    subjectSlugs: [],
    strengths: [],
    examDate: '',
    dailyStudyMinutes: 120,
    preferredStudyWindows: ['morning'],
  })

  const { data: subjectsData, isLoading: subjectsLoading } = useSubjects()
  const subjects = subjectsData ?? []

  // Pre-select English when JAMB is among the selected exams
  useEffect(() => {
    if (state.examTypes.includes('jamb') && !state.subjectSlugs.includes('english')) {
      setState((s) => ({ ...s, subjectSlugs: ['english', ...s.subjectSlugs.filter((x) => x !== 'english')] }))
    }
  }, [state.examTypes]) // eslint-disable-line react-hooks/exhaustive-deps

  // Initialise strengths when subjects change
  useEffect(() => {
    const slugs = state.subjectSlugs
    if (slugs.length === 0) return
    const existing = new Set(state.strengths.map((s) => s.subjectSlug))
    const missing = slugs.filter((s) => !existing.has(s))
    if (missing.length > 0) {
      setState((prev) => ({
        ...prev,
        strengths: [
          ...prev.strengths,
          ...missing.map((slug) => ({ subjectSlug: slug, level: 'average' as StrengthLevel })),
        ],
      }))
    }
  }, [state.subjectSlugs]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalWeeks = state.examDate
    ? Math.max(1, Math.round(differenceInDays(new Date(state.examDate), new Date()) / 7))
    : 0

  const totalTopics = subjects
    .filter((s) => state.subjectSlugs.includes(s.slug))
    .reduce((sum, s) => sum + s.topics.length, 0)

  // The user-visible step count is 6 (step 7 is the generating screen)
  const VISIBLE_STEPS = 6

  // Validation per step
  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return state.examTypes.length > 0
      case 2: {
        const needsLearningStyle = state.examTypes.includes('waec') || state.examTypes.includes('neco')
        return needsLearningStyle ? state.learningStyle !== null : true
      }
      case 3: {
        const { min } = getSubjectLimits(state.examTypes)
        return state.subjectSlugs.length >= min
      }
      case 4:
        return true // always valid — defaults to average
      case 5:
        return state.examDate !== '' && differenceInDays(new Date(state.examDate), new Date()) > 0
      case 6:
        return state.preferredStudyWindows.length > 0
      default:
        return true
    }
  }, [currentStep, state])

  // API call per step
  const persistStep = useCallback(async (step: number): Promise<boolean> => {
    try {
      switch (step) {
        case 1:
          // NOTE: backend /onboarding/step/1 must accept `examTypes` as an
          // array now instead of a single `examType` string — confirm this
          // with backend before shipping.
          await api.post('/onboarding/step/1', { examTypes: state.examTypes })
          break
        case 2: {
          const isJamb = state.examTypes.includes('jamb')
          const needsLearningStyle = state.examTypes.includes('waec') || state.examTypes.includes('neco')
          const calls: Promise<unknown>[] = []
          if (isJamb) {
            calls.push(
              api.post('/onboarding/step/2/jamb', {
                schoolName: state.schoolName || undefined,
                institutionType: state.institutionType || undefined,
              }),
            )
          }
          if (needsLearningStyle) {
            calls.push(
              api.post('/onboarding/step/2/waec', {
                learningStyle: state.learningStyle,
              }),
            )
          }
          await Promise.all(calls)
          break
        }
        case 3:
          await api.post('/onboarding/step/3', { subjectSlugs: state.subjectSlugs })
          break
        case 4:
          await api.post('/onboarding/step/4', { strengths: state.strengths })
          break
        case 5: {
          // Convert date string to ISO datetime
          const dateObj = new Date(state.examDate)
          dateObj.setUTCHours(12, 0, 0, 0)
          await api.post('/onboarding/step/5', { examDate: dateObj.toISOString() })
          break
        }
        case 6:
          await api.post('/onboarding/step/6', {
            dailyStudyMinutes: state.dailyStudyMinutes,
            preferredStudyWindows: state.preferredStudyWindows,
          })
          break
      }
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast({
        title: 'Could not save progress',
        description: message,
        variant: 'danger',
      })
      return false
    }
  }, [state, toast])

  const handleContinue = async () => {
    if (!canProceed()) return
    setIsSubmitting(true)

    const saved = await persistStep(currentStep)
    setIsSubmitting(false)

    if (!saved) return // error toast shown inside persistStep

    if (currentStep === 6) {
      // Move to generating screen then complete
      setCurrentStep(7)
      try {
        const result = await api.post<{
          data: {
            user: {
              id: string
              name: string
              email: string
              plan: 'free' | 'scholar'
              onboardingCompleted: boolean
              onboardingStep: number
              theme: 'system' | 'light' | 'dark'
              timezone: string
              avatarUrl?: string
            }
          }
        }>('/onboarding/complete')
        setUser(result.data.user)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to complete onboarding'
        toast({ title: 'Roadmap generation failed', description: message, variant: 'danger' })
      }
      // Wait for all the checklist ticks (4 * 600ms + buffer) then redirect
      setTimeout(() => {
        router.push('/dashboard')
      }, 3200)
      return
    }

    setCurrentStep((s) => s + 1)
  }

  const handleBack = () => {
    if (currentStep <= 1) return
    setCurrentStep((s) => s - 1)
  }

  // Render
  return (
    <div style={{ width: '100%', maxWidth: 540 }}>
      {currentStep <= VISIBLE_STEPS && (
        <ProgressBar step={currentStep} total={VISIBLE_STEPS} />
      )}

      {/* Step content */}
      {currentStep === 1 && (
        <Step1
          value={state.examTypes}
          onChange={(v) => setState((s) => ({ ...s, examTypes: v }))}
        />
      )}

      {currentStep === 2 && (
        <>
          {state.examTypes.includes('jamb') && (
            <Step2Jamb
              schoolName={state.schoolName}
              institutionType={state.institutionType}
              onSchoolName={(v) => setState((s) => ({ ...s, schoolName: v }))}
              onInstitution={(v) => setState((s) => ({ ...s, institutionType: v }))}
            />
          )}

          {state.examTypes.includes('jamb') &&
            (state.examTypes.includes('waec') || state.examTypes.includes('neco')) && (
              <div style={{ height: 1, backgroundColor: 'var(--color-rule)', margin: '32px 0' }} />
            )}

          {(state.examTypes.includes('waec') || state.examTypes.includes('neco')) && (
            <Step2Waec
              value={state.learningStyle}
              onChange={(v) => setState((s) => ({ ...s, learningStyle: v }))}
            />
          )}
        </>
      )}

      {currentStep === 3 && (
        <Step3
          subjects={subjects}
          loading={subjectsLoading}
          examTypes={state.examTypes}
          selected={state.subjectSlugs}
          onChange={(slugs) => setState((s) => ({ ...s, subjectSlugs: slugs }))}
        />
      )}

      {currentStep === 4 && (
        <Step4
          subjects={subjects}
          selectedSlugs={state.subjectSlugs}
          strengths={state.strengths}
          onChange={(strengths) => setState((s) => ({ ...s, strengths }))}
        />
      )}

      {currentStep === 5 && (
        <Step5
          value={state.examDate}
          onChange={(v) => setState((s) => ({ ...s, examDate: v }))}
        />
      )}

      {currentStep === 6 && (
        <Step6
          minutes={state.dailyStudyMinutes}
          windows={state.preferredStudyWindows}
          onMinutes={(v) => setState((s) => ({ ...s, dailyStudyMinutes: v }))}
          onWindows={(v) => setState((s) => ({ ...s, preferredStudyWindows: v }))}
        />
      )}

      {currentStep === 7 && (
        <Step7Generating
          subjectCount={state.subjectSlugs.length}
          topicCount={totalTopics}
          weekCount={totalWeeks}
        />
      )}

      {/* Navigation */}
      {currentStep <= VISIBLE_STEPS && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginTop: 36,
          }}
        >
          <Button
            variant="accent"
            size="lg"
            onClick={handleContinue}
            disabled={!canProceed() || isSubmitting}
            style={{ width: '100%' }}
          >
            {isSubmitting
              ? 'Saving...'
              : currentStep === VISIBLE_STEPS
              ? 'Build my roadmap'
              : tCommon('continue')}
          </Button>

          {currentStep > 1 && (
            <Button
              variant="ghost"
              size="default"
              onClick={handleBack}
              disabled={isSubmitting}
              style={{ width: '100%' }}
            >
              {tCommon('back')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}