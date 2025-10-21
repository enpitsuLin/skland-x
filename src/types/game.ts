export interface AttendanceStatus {
  currentTs: string
  calendar: {
    resourceId: string
    type: string
    count: number
    available: boolean
    done: boolean
  }[]
  records: {
    resourceId: string
    type: string
    count: number
    ts: string
  }[]
  resourceInfoMap: {
    [key: string]: {
      id: string
      name: string
      type: string
    }
  }
}

export interface AttendanceAwards {
  ts: number
  awards: {
    resource: {
      id: string
      name: string
      type: string
    }
    count: number
  }[]
}
