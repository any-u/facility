import fetch from 'node-fetch'


const get = async (url) => {
    try {
        const res = await fetch(url)
        return res.json()
    } catch (err) {
        // TODO: catch error 
        // consider DNS pollution
    }
}


export const Request = {
    get
}