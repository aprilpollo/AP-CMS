import { createContext } from 'react';
import { type SettingsConfigType } from '@/settings/context/SettingsContext';

type LayoutSettingsContextType = SettingsConfigType['layout'];

const LayoutSettingsContext = createContext<LayoutSettingsContextType | undefined>(undefined);

export default LayoutSettingsContext;
