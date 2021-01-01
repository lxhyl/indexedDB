const DEFAULT_STRING = '1234567890abcdefghigklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const makeRandomStr = (l) => {
    let result = '';
    for(let i=0;i<l+1;i++){  
       const randomIndex = parseInt(Math.random()*DEFAULT_STRING.length);
       result = `${result}${DEFAULT_STRING[randomIndex]}`
    }
    return result;
}

const getTime = () => Date.now();

const makeId = (l) => {
    return `${getTime()}-${makeRandomStr(l)}`;
}

