interface AppConfig {
    name: string,
    github: {
        title: string,
        url: string
    },
    author: {
        name: string,
        url: string
    },
}

export const appConfig: AppConfig = {
    name: "Etv Bharat",
    github: {
        title: "React Shadcn Starter",
        url: "https://www.etvbharat.com/",
    },
    author: {
        name: "Etv Bharat",
        url: "https://www.etvbharat.com/",
    }
}



export const BASE_URL = "http://test.kb.etvbharat.com/wp-json/";
