{
  init: function(elevators, floors) {
    elevators.forEach((elevator, i) => {
      elevator.on("idle", function() {
         floors.forEach((floor) => {
           elevator.goToFloor(0);
         });
      });
      elevator.on("passing_floor", (floorNum, direction) => {
        console.log("elevator " + i + " passing_floor " + floorNum + " destinationQueue: " + elevator.destinationQueue + " loadfactor: " + elevator.loadFactor());
        if (elevator.getPressedFloors().indexOf(floorNum) > -1) {
          const newDestinationQueue = elevator.destinationQueue.filter((qe) => {
            return qe != floorNum;
          })
          elevator.destinationQueue = [floorNum, ...newDestinationQueue];
          elevator.checkDestinationQueue();
          // elevator.goToFloor(floorNum, true);
        }
      });
      elevator.on("floor_button_pressed", (floorNum) => {
        if (elevator.destinationQueue.indexOf(floorNum) == -1) {
          elevator.goToFloor(floorNum);
        }
      });
    });

    onButtonPressed = (f, es) => {
      let alreadyInQueue = false;
      es.forEach((e) => {
        if (e.destinationQueue.indexOf(f.floorNum()) > -1) {
          alreadyInQueue = true;
        }
      });

      if (!alreadyInQueue) {
        let smallestLoadFactor = Number.MAX_VALUE;
        let elevatorWithSmallestLoadFactor = null;
        es.forEach((e) => {
          if (e.loadFactor() < smallestLoadFactor) {
            smallestLoadFactor = e.destinationQueue.length;
            elevatorWithSmallestLoadFactor = e;
          }
        });
        elevatorWithSmallestLoadFactor.goToFloor(f.floorNum());
      }
    };

    floors.forEach((floor) => {
      floor.on("up_button_pressed", () => {
        onButtonPressed(floor, elevators);
      });
      floor.on("down_button_pressed", () => {
        onButtonPressed(floor, elevators);
      });
    });
  },
    update: function(dt, elevators, floors) {
      // We normally don't need to do anything here
    }
}
