import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Languages, 
  Save, 
  RotateCcw, 
  Search, 
  Filter,
  Edit3,
  Check,
  X,
  Globe
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { translationService, TRANSLATION_CATEGORIES, DEFAULT_ENGLISH_TRANSLATIONS, DEFAULT_ARABIC_TRANSLATIONS } from '@/services/translationService';


export default function LanguageSettings() {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  
  // State for managing translations
  const [translations, setTranslations] = useState<Record<string, { en: string; ar: string }>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ en: string; ar: string }>({ en: '', ar: '' });
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize translations from service
  useEffect(() => {
    setTranslations(translationService.getAllTranslations());
  }, []);


  // Filter translations based on search term and category
  const filteredTranslations = Object.entries(translations).filter(([key, value]) => {
    const matchesSearch = searchTerm === '' || 
      key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      value.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      value.ar.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      TRANSLATION_CATEGORIES[selectedCategory as keyof typeof TRANSLATION_CATEGORIES]?.keys.includes(key);
    
    return matchesSearch && matchesCategory;
  });

  // Handle editing a translation
  const handleEditTranslation = (key: string) => {
    setEditingKey(key);
    setEditValues(translations[key] || { en: '', ar: '' });
  };

  // Handle saving a translation
  const handleSaveTranslation = () => {
    if (editingKey) {
      translationService.updateTranslation(editingKey, editValues.en, editValues.ar);
      setTranslations(translationService.getAllTranslations());
      setHasChanges(true);
      setEditingKey(null);
      setEditValues({ en: '', ar: '' });
      
      toast({
        title: "Translation Updated",
        description: `Translation for "${editingKey}" has been updated successfully.`,
      });
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditValues({ en: '', ar: '' });
  };

  // Handle saving all changes
  const handleSaveAllChanges = () => {
    // Translations are automatically saved to localStorage via the service
    setHasChanges(false);
    toast({
      title: "All Changes Saved",
      description: "All translation changes have been saved successfully.",
    });
  };

  // Handle resetting to defaults
  const handleResetToDefaults = () => {
    translationService.resetToDefaults();
    setTranslations(translationService.getAllTranslations());
    setHasChanges(false);
    
    toast({
      title: "Reset to Defaults",
      description: "All translations have been reset to their default values.",
    });
  };

  return (
    <div className={`space-y-3 sm:space-y-4 md:space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className={`px-1 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Languages className="h-6 w-6 sm:h-8 sm:w-8" />
          {t.languageSettings}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
          {t.customizeTranslationValues}
        </p>
      </div>

      {/* Action Buttons */}
      <div className={`flex flex-col sm:flex-row gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
          onClick={handleSaveAllChanges} 
          disabled={!hasChanges}
          className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Save className="h-4 w-4" />
          Save All Changes
            </Button>
            <Button
          onClick={handleResetToDefaults} 
          variant="outline"
          className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
            </Button>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">Current Language: {language === 'en' ? 'English' : 'العربية'}</span>
        </div>
          </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex-1">
              <Label htmlFor="search" className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>Search Translations</Label>
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input
                id="search"
                  placeholder="Search by key or translation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${isRTL ? 'pr-10 text-right' : 'pl-10 text-left'}`}
              />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="category" className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>Category</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-3 py-2 border border-input bg-background rounded-md text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <option value="all">All Categories</option>
                {Object.entries(TRANSLATION_CATEGORIES).map(([key, category]) => (
                  <option key={key} value={key}>{category.title}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translation Editor */}
      <Card>
        <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Edit3 className="h-5 w-5" />
            Translation Editor
              </CardTitle>
          <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
            Edit translations for both English and Arabic. Changes will be applied immediately.
              </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] sm:h-[500px] md:h-[600px]">
            <div className="space-y-3 sm:space-y-4">
              {filteredTranslations.map(([key, value]) => (
                <div key={key} className="border rounded-lg p-3 sm:p-4">
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {key}
                      </Badge>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {TRANSLATION_CATEGORIES[Object.keys(TRANSLATION_CATEGORIES).find(cat => 
                          TRANSLATION_CATEGORIES[cat as keyof typeof TRANSLATION_CATEGORIES].keys.includes(key)
                        ) as keyof typeof TRANSLATION_CATEGORIES]?.title || 'General'}
                      </span>
            </div>
                <Button
                  variant="outline"
                  size="sm"
                      onClick={() => handleEditTranslation(key)}
                      className="gap-2"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </Button>
                  </div>

                  {editingKey === key ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`en-${key}`} className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                            English Translation
                          </Label>
                          <Textarea
                            id={`en-${key}`}
                            value={editValues.en}
                            onChange={(e) => setEditValues(prev => ({ ...prev, en: e.target.value }))}
                            className={`min-h-[60px] sm:min-h-[80px] ${isRTL ? 'text-right' : 'text-left'}`}
                            placeholder="Enter English translation..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`ar-${key}`} className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                            Arabic Translation
                          </Label>
                          <Textarea
                            id={`ar-${key}`}
                            value={editValues.ar}
                            onChange={(e) => setEditValues(prev => ({ ...prev, ar: e.target.value }))}
                            className={`min-h-[60px] sm:min-h-[80px] ${isRTL ? 'text-right' : 'text-left'}`}
                            placeholder="Enter Arabic translation..."
                            dir="rtl"
                          />
                        </div>
                      </div>
                      <div className={`flex flex-col sm:flex-row gap-2 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                        <Button onClick={handleSaveTranslation} size="sm" className="gap-2">
                          <Check className="h-3 w-3" />
                          Save
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline" size="sm" className="gap-2">
                          <X className="h-3 w-3" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                          English
                        </Label>
                        <div className={`p-2 sm:p-3 bg-muted rounded-md text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                          {value.en}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                          العربية
                        </Label>
                        <div className={`p-2 sm:p-3 bg-muted rounded-md text-sm ${isRTL ? 'text-right' : 'text-left'}`} dir="rtl">
                          {value.ar}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

    </div>
  );
}