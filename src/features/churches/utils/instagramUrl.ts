

export function getInstagramURL(instagramName: string){
    if (!instagramName || instagramName === ''){
        return null;
    }
   
    return `https://instagram.com/${instagramName.replace(/^@/, '')}`

}