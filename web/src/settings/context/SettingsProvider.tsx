import { Component, type ReactNode } from "react"
import _ from "lodash"
import settingsConfig from "@/configs/setting"
import themeLayoutConfigs from "@/layouts/configs/themeLayoutConfigs"
import { type SettingsConfigType } from "./SettingsContext"
import { getRouteParamUtil } from "@/hooks/useRouteParameter"
import withRouter, { type WithRouterProps } from "@/shared/withRouter"
import withUser from "@/auth/hooks/withUser"
import { type User } from "@/auth/user"
import type { PartialDeep } from "type-fest"
import SettingsContext, {
  type SettingsContextType,
  type SettingsProviderState,
} from "./SettingsContext"

// Default settings - simplified version
const defaultSettings: SettingsConfigType = settingsConfig

// Parse query settings from URL (for development/testing)
const getParsedQuerySettings = (): Partial<SettingsConfigType> => {
  if (typeof window === "undefined") return {}
  const params = new URLSearchParams(window.location.search)
  const settingsParam = params.get("settings")
  if (settingsParam) {
    try {
      return JSON.parse(settingsParam)
    } catch {
      return {}
    }
  }
  return {}
}

// Get initial settings
const getInitialSettings = (): SettingsConfigType => {
  const defaultLayoutStyle = settingsConfig.layout?.style || "layout"
  const layout = {
    style: defaultLayoutStyle,
    config: themeLayoutConfigs[defaultLayoutStyle]?.defaults,
  }
  return _.merge(
    {},
    defaultSettings,
    { layout },
    settingsConfig,
    getParsedQuerySettings()
  )
}

const initialSettings = getInitialSettings()

interface SettingsProviderProps extends WithRouterProps {
  children: ReactNode
  data: User
}

const generateSettings = (
  _defaultSettings: SettingsConfigType,
  _newSettings: PartialDeep<SettingsConfigType>
) => {
  const newStyle = _newSettings?.layout?.style
  return _.merge(
    {},
    _defaultSettings,
    {
      layout: {
        config: newStyle ? themeLayoutConfigs[newStyle]?.defaults : undefined,
      },
    },
    _newSettings
  )
}
class SettingsProvider extends Component<
  SettingsProviderProps,
  SettingsProviderState
> {
  constructor(props: SettingsProviderProps) {
    super(props)

    const userSettings = props?.data?.settings as
      | PartialDeep<SettingsConfigType>
      | undefined

    const initial = _.merge({}, initialSettings, userSettings)

    this.state = {
      initial,
      defaults: _.merge({}, initial),
      data: _.merge({}, initial),
      userSettings,
    }
  }

  static getDerivedStateFromProps(
    _nextProps: SettingsProviderProps,
    prevState: SettingsProviderState
  ) {
    const { data: user, location } = _nextProps

    const userSettings = user?.settings as
      | PartialDeep<SettingsConfigType>
      | undefined

    const userSettingsChanged = !_.isEqual(userSettings, prevState.userSettings)

    const defaults = userSettingsChanged
      ? generateSettings(prevState.defaults, userSettings ?? {})
      : prevState.defaults

    const matchedSettings = getRouteParamUtil(
      location.pathname,
      "settings",
      true
    )

    const newSettings = _.merge({}, defaults, matchedSettings)

    return { ...prevState, data: newSettings, userSettings }
  }

  shouldComponentUpdate(
    _nextProps: Readonly<SettingsProviderProps>,
    nextState: Readonly<SettingsProviderState>,
    _nextContext: any
  ) {
    const { data } = this.state
    return !_.isEqual(data, nextState.data)
  }

  setSettings = (newSettings: Partial<SettingsConfigType>) => {
    const { defaults } = this.state
    const newDefaults = generateSettings(defaults, newSettings)

    this.setState((prevState) => {
      return {
        ...prevState,
        defaults: newDefaults,
      }
    })

    return newDefaults
  }

  render() {
    const { children } = this.props
    const { data, initial, defaults } = this.state
    const { setSettings } = this

    const contextValue: SettingsContextType = {
      data,
      initial,
      defaults,
      setSettings,
    }

    return <SettingsContext value={contextValue}>{children}</SettingsContext>
  }
}
const SettingsProviderWithRouterUser = withRouter(withUser(SettingsProvider))

export default SettingsProviderWithRouterUser
