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
        url: "https://github.com/hayyi2/react-shadcn-starter",
    },
    author: {
        name: "Etv Bharat",
        url: "https://github.com/VarshaKakumanu/web-Etv",
    }
}



export const BASE_URL = "http://test.kb.etvbharat.com/wp-json/";
