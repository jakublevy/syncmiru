interface User extends UserValue {
    id: number
}

type UserId = number
interface UserValue {
    username: string,
    displayname: string,
    avatar: Array<number> | undefined
}
