'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { 
  HeartIcon,  // Health & Wellness
  ScaleIcon,  // Weight & Measurements
  ChartBarIcon,  // Progress Tracking
  ClockIcon,  // Time & Schedule
  UserGroupIcon,  // Community
  AcademicCapIcon,  // Education & Expertise
  BeakerIcon,  // Science & Research
  BoltIcon,  // Energy & Performance
  FireIcon,  // Calories & Metabolism
  SparklesIcon,  // Goals & Achievements
  ShieldCheckIcon,  // Safety & Protection
  HandThumbUpIcon,  // Success & Approval
  BookOpenIcon,  // Knowledge & Learning
  BellAlertIcon,  // Notifications & Reminders
  CalendarIcon,  // Planning & Scheduling
  ChatBubbleLeftRightIcon,  // Communication & Support
  ClipboardDocumentCheckIcon,  // Tracking & Monitoring
  RocketLaunchIcon,  // Progress & Growth
  TrophyIcon,  // Achievements
  UserIcon,  // Personal Profile
  CakeIcon,  // Food & Desserts
  CogIcon,  // Settings & Customization
  CurrencyDollarIcon,  // Pricing & Value
  DocumentTextIcon,  // Documentation & Resources
  GlobeAltIcon,  // Global & Accessibility
  LightBulbIcon,  // Ideas & Innovation
  PresentationChartLineIcon,  // Analytics & Insights
  PuzzlePieceIcon,  // Integration & Compatibility
  QueueListIcon,  // Lists & Organization
  StarIcon,  // Ratings & Reviews
  TableCellsIcon,  // Data & Tables
  TagIcon,  // Labels & Categories
  WrenchIcon,  // Tools & Utilities
  ArrowTrendingUpIcon,  // Growth & Trends
  BuildingOfficeIcon,  // Business & Professional
  CalculatorIcon,  // Calculations & Math
  ComputerDesktopIcon,  // Technology & Devices
  DevicePhoneMobileIcon,  // Mobile & Apps
  FlagIcon,  // Goals & Milestones
  BeakerIcon as BeakerIcon2,  // Supplements & Vitamins
  HeartIcon as HeartIcon2,  // Cardiovascular Health
  FireIcon as FireIcon2,  // Metabolism & Energy
  ScaleIcon as ScaleIcon2,  // Body Composition
  ClockIcon as ClockIcon2,  // Meal Timing
  ShieldCheckIcon as ShieldCheckIcon2,  // Immune System
  BoltIcon as BoltIcon2,  // Athletic Performance
  SparklesIcon as SparklesIcon2,  // Wellness & Vitality
  HandThumbUpIcon as HandThumbUp2,  // Healthy Choices
  UserIcon as UserIcon2,  // Personal Health
  DocumentCheckIcon,  // Health Records
  DocumentChartBarIcon,  // Health Analytics
  DocumentMagnifyingGlassIcon,  // Health Insights
  CloudArrowUpIcon,  // Cloud Sync
  ArrowPathIcon,  // Sync & Updates
  LinkIcon,  // Integrations
  MagnifyingGlassIcon,  // Search & Discovery
  MapPinIcon,  // Location Based
  PhoneIcon,  // Mobile Access
  ServerIcon,  // Data Storage
  Square3Stack3DIcon,  // Multiple Features
  SunIcon,  // Lifestyle
  TableCellsIcon as TableCellsIcon2,  // Meal Planning
  TagIcon as TagIcon2,  // Food Labels
  UserGroupIcon as UserGroupIcon2,  // Group Support
  UserPlusIcon,  // Add Members
  UsersIcon,  // Community
  VideoCameraIcon,  // Video Content
  WrenchScrewdriverIcon,  // Tools & Settings
  XCircleIcon,  // Restrictions & Allergies
  CheckCircleIcon,  // Approved Foods
  ExclamationCircleIcon,  // Food Warnings
  InformationCircleIcon,  // Nutritional Info
  QuestionMarkCircleIcon,  // Help & Support
  ArrowPathRoundedSquareIcon,  // Food Cycle
  Bars3BottomLeftIcon,  // Menu & Navigation
  Bars3CenterLeftIcon,  // Categories
  BarsArrowUpIcon,  // Progress Up
  BuildingLibraryIcon,  // Knowledge Base
  ChartPieIcon,  // Nutritional Charts
  CircleStackIcon,  // Food Database
  ClipboardIcon,  // Food Log
  CloudIcon,  // Cloud Features
  CubeIcon,  // Food Portions
  CubeTransparentIcon,  // Macro Tracking
  FingerPrintIcon  // Personal ID
} from '@heroicons/react/24/outline'

interface Feature {
  id: number
  title: string
  description: string
  icon_name: keyof typeof featureIcons
  order: number
}

interface FeatureChanges {
  [key: number]: {
    title?: string
    description?: string
    icon_name?: string
    order?: number
  }
}

interface HeaderContent {
  heading: string
  paragraph: string
  button_text: string
  button_url: string
}

const featureIcons = {
  heart: HeartIcon,  // Health & Wellness
  scale: ScaleIcon,  // Weight & Measurements
  chart: ChartBarIcon,  // Progress Tracking
  clock: ClockIcon,  // Time & Schedule
  users: UserGroupIcon,  // Community
  academic: AcademicCapIcon,  // Education & Expertise
  beaker: BeakerIcon,  // Science & Research
  bolt: BoltIcon,  // Energy & Performance
  fire: FireIcon,  // Calories & Metabolism
  sparkles: SparklesIcon,  // Goals & Achievements
  shield: ShieldCheckIcon,  // Safety & Protection
  thumbUp: HandThumbUpIcon,  // Success & Approval
  book: BookOpenIcon,  // Knowledge & Learning
  bell: BellAlertIcon,  // Notifications & Reminders
  calendar: CalendarIcon,  // Planning & Scheduling
  chat: ChatBubbleLeftRightIcon,  // Communication & Support
  clipboard: ClipboardDocumentCheckIcon,  // Tracking & Monitoring
  rocket: RocketLaunchIcon,  // Progress & Growth
  trophy: TrophyIcon,  // Achievements
  user: UserIcon,  // Personal Profile
  cake: CakeIcon,  // Food & Desserts
  cog: CogIcon,  // Settings & Customization
  dollar: CurrencyDollarIcon,  // Pricing & Value
  document: DocumentTextIcon,  // Documentation & Resources
  globe: GlobeAltIcon,  // Global & Accessibility
  bulb: LightBulbIcon,  // Ideas & Innovation
  presentation: PresentationChartLineIcon,  // Analytics & Insights
  puzzle: PuzzlePieceIcon,  // Integration & Compatibility
  list: QueueListIcon,  // Lists & Organization
  star: StarIcon,  // Ratings & Reviews
  table: TableCellsIcon,  // Data & Tables
  tag: TagIcon,  // Labels & Categories
  wrench: WrenchIcon,  // Tools & Utilities
  trend: ArrowTrendingUpIcon,  // Growth & Trends
  building: BuildingOfficeIcon,  // Business & Professional
  calculator: CalculatorIcon,  // Calculations & Math
  desktop: ComputerDesktopIcon,  // Technology & Devices
  mobile: DevicePhoneMobileIcon,  // Mobile & Apps
  flag: FlagIcon,  // Goals & Milestones
  supplements: BeakerIcon2,  // Supplements & Vitamins
  cardio: HeartIcon2,  // Cardiovascular Health
  metabolism: FireIcon2,  // Metabolism & Energy
  bodyComp: ScaleIcon2,  // Body Composition
  mealTime: ClockIcon2,  // Meal Timing
  immune: ShieldCheckIcon2,  // Immune System
  performance: BoltIcon2,  // Athletic Performance
  wellness: SparklesIcon2,  // Wellness & Vitality
  healthyChoice: HandThumbUp2,  // Healthy Choices
  personalHealth: UserIcon2,  // Personal Health
  healthRecords: DocumentCheckIcon,  // Health Records
  healthAnalytics: DocumentChartBarIcon,  // Health Analytics
  healthInsights: DocumentMagnifyingGlassIcon,  // Health Insights
  sync: CloudArrowUpIcon,  // Cloud Sync
  update: ArrowPathIcon,  // Sync & Updates
  connect: LinkIcon,  // Integrations
  search: MagnifyingGlassIcon,  // Search & Discovery
  location: MapPinIcon,  // Location Based
  phone: PhoneIcon,  // Mobile Access
  server: ServerIcon,  // Data Storage
  features: Square3Stack3DIcon,  // Multiple Features
  lifestyle: SunIcon,  // Lifestyle
  mealPlan: TableCellsIcon2,  // Meal Planning
  foodLabel: TagIcon2,  // Food Labels
  groupSupport: UserGroupIcon2,  // Group Support
  addMember: UserPlusIcon,  // Add Members
  community: UsersIcon,  // Community
  video: VideoCameraIcon,  // Video Content
  tools: WrenchScrewdriverIcon,  // Tools & Settings
  allergies: XCircleIcon,  // Restrictions & Allergies
  approved: CheckCircleIcon,  // Approved Foods
  warning: ExclamationCircleIcon,  // Food Warnings
  info: InformationCircleIcon,  // Nutritional Info
  help: QuestionMarkCircleIcon,  // Help & Support
  foodCycle: ArrowPathRoundedSquareIcon,  // Food Cycle
  menu: Bars3BottomLeftIcon,  // Menu & Navigation
  categories: Bars3CenterLeftIcon,  // Categories
  progressUp: BarsArrowUpIcon,  // Progress Up
  library: BuildingLibraryIcon,  // Knowledge Base
  nutrition: ChartPieIcon,  // Nutritional Charts
  database: CircleStackIcon,  // Food Database
  foodLog: ClipboardIcon,  // Food Log
  cloud: CloudIcon,  // Cloud Features
  portions: CubeIcon,  // Food Portions
  macros: CubeTransparentIcon,  // Macro Tracking
  fingerprint: FingerPrintIcon  // Personal ID
} as const

const defaultFeature: Omit<Feature, 'id'> = {
  title: '',
  description: '',
  icon_name: 'heart',
  order: 0
}

const defaultHeaderContent: HeaderContent = {
  heading: '',
  paragraph: '',
  button_text: '',
  button_url: ''
}

const HomepageFeaturesTab = () => {
  const [features, setFeatures] = useState<Feature[]>([])
  const [headerContent, setHeaderContent] = useState<HeaderContent>(defaultHeaderContent)
  const [unsavedChanges, setUnsavedChanges] = useState<FeatureChanges>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchFeatures()
    fetchHeaderContent()
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .order('order')

      if (error) throw error

      setFeatures(data || [])
      setUnsavedChanges({})
    } catch (error) {
      console.error('Error fetching features:', error)
      toast.error('Failed to load features')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchHeaderContent = async () => {
    try {
      const { data, error } = await supabase
        .from('features_header')
        .select('*')
        .single()

      if (error) throw error

      if (data) {
        setHeaderContent(data)
      }
    } catch (error) {
      console.error('Error fetching header content:', error)
      toast.error('Failed to load header content')
    }
  }

  const handleUpdateFeature = (index: number, updates: Partial<Feature>) => {
    const feature = features[index]
    if (!feature) return

    // Update local state immediately
    const updatedFeatures = features.map((f, i) => {
      if (i === index) {
        return { ...f, ...updates }
      }
      return f
    })
    setFeatures(updatedFeatures)

    // Track unsaved changes
    setUnsavedChanges(prev => ({
      ...prev,
      [feature.id]: { ...(prev[feature.id] || {}), ...updates }
    }))
  }

  const handleHeaderChange = (field: keyof HeaderContent, value: string) => {
    setHeaderContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      // Save all changes
      for (const [featureId, updates] of Object.entries(unsavedChanges)) {
        const { error } = await supabase
          .from('features')
          .update(updates)
          .eq('id', featureId)

        if (error) throw error
      }

      setUnsavedChanges({})
      toast.success('Changes saved successfully')
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveHeaderContent = async () => {
    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('features_header')
        .update(headerContent)
        .eq('id', 1)

      if (error) throw error

      toast.success('Header content saved successfully')
    } catch (error) {
      console.error('Error saving header content:', error)
      toast.error('Failed to save header content')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddFeature = async () => {
    if (features.length >= 6) {
      toast.error('Maximum of 6 features allowed')
      return
    }

    const newFeature = {
      ...defaultFeature,
      order: features.length
    }

    try {
      const { data, error } = await supabase
        .from('features')
        .insert([newFeature])
        .select()
        .single()

      if (error) throw error

      setFeatures([...features, data])
      toast.success('Feature added successfully')
    } catch (error) {
      console.error('Error adding feature:', error)
      toast.error('Failed to add feature')
    }
  }

  const handleDeleteFeature = async (index: number) => {
    const feature = features[index]
    if (!feature) return

    try {
      const { error } = await supabase
        .from('features')
        .delete()
        .eq('id', feature.id)

      if (error) throw error

      const updatedFeatures = features.filter((_, i) => i !== index)
      // Update order for remaining features
      for (let i = 0; i < updatedFeatures.length; i++) {
        await supabase
          .from('features')
          .update({ order: i })
          .eq('id', updatedFeatures[i].id)
      }

      setFeatures(updatedFeatures)
      toast.success('Feature deleted successfully')
    } catch (error) {
      console.error('Error deleting feature:', error)
      toast.error('Failed to delete feature')
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(features)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order in state
    setFeatures(items)

    // Update order in database
    try {
      for (let i = 0; i < items.length; i++) {
        await supabase
          .from('features')
          .update({ order: i })
          .eq('id', items[i].id)
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    }
  }

  const hasUnsavedChanges = Object.keys(unsavedChanges).length > 0

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Content Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Features Page Header
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Heading
            </label>
            <input
              type="text"
              value={headerContent.heading}
              onChange={(e) => handleHeaderChange('heading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Paragraph
            </label>
            <textarea
              value={headerContent.paragraph}
              onChange={(e) => handleHeaderChange('paragraph', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={headerContent.button_text}
                onChange={(e) => handleHeaderChange('button_text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Button URL
              </label>
              <input
                type="text"
                value={headerContent.button_url}
                onChange={(e) => handleHeaderChange('button_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveHeaderContent}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Header'}
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Homepage Features</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add and manage features displayed on your homepage
              </p>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <span className="hidden sm:flex items-center text-sm text-amber-600 dark:text-amber-400">
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Unsaved changes
                </span>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveChanges}
                  disabled={!hasUnsavedChanges || isSaving}
                  className={`
                    inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${hasUnsavedChanges
                      ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save
                    </>
                  )}
                </button>
                <button
                  onClick={handleAddFeature}
                  disabled={features.length >= 6}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Feature
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="relative">
          {features.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No features</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new feature.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="features">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6"
                  >
                    {features.map((feature, index) => (
                      <Draggable
                        key={feature.id}
                        draggableId={feature.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`
                              relative p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700
                              transition-all duration-200 hover:shadow-md
                              ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''}
                            `}
                          >
                            {/* Feature Card Header */}
                            <div className="flex items-center justify-between mb-5">
                              <div
                                {...provided.dragHandleProps}
                                className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white"
                              >
                                <div className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-move transition-colors">
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                  </svg>
                                </div>
                                <span>Feature {index + 1}</span>
                              </div>
                              <button
                                onClick={() => handleDeleteFeature(index)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Delete feature"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-5">
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Icon
                                  </label>
                                  <select
                                    value={feature.icon_name}
                                    onChange={(e) => handleUpdateFeature(index, { icon_name: e.target.value as keyof typeof featureIcons })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    {Object.entries(featureIcons).map(([key, Icon]) => (
                                      <option key={key} value={key}>
                                        {key.charAt(0).toUpperCase() + key.slice(1)} Icon
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Title
                                  </label>
                                  <input
                                    type="text"
                                    value={feature.title}
                                    onChange={(e) => handleUpdateFeature(index, { title: e.target.value })}
                                    placeholder="Feature Title"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                  </label>
                                  <textarea
                                    value={feature.description}
                                    onChange={(e) => handleUpdateFeature(index, { description: e.target.value })}
                                    placeholder="Feature Description"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* Feature Count */}
          <div className="absolute bottom-4 right-6">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {features.length}/6 features
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomepageFeaturesTab
