const getActualLocation = async () => {

    return new Promise((resolve, reject) => 
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.logitude,
          });
        },
        error=>reject(error)
      )
    )
  }