const URL_BASE = "https://3000-f44035af-2256-4fb9-a8e3-4045fddf5dc6.ws-eu01.gitpod.io"

export default class BackendService
{
  async init() 
  {
    const response = await fetch( URL_BASE + '/init' )
    const data = await response.json()
    return data as {
      user : { spins : number , coins : number }
    }
  }

  async spin() 
  {
    const response = await fetch( URL_BASE + '/spin' )
    const data = await response.json()
    return data as {
      result : { 
        symbols : [ number, number, number ]
        reward : { coins : number }
      } [ ] , 
      user : { spins : number , coins : number }
    }
  }
}