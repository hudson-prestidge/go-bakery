const sayHi = function greeter(person: string) {
  return `Hello, ${person}`
}

let user = "Jane User"

document.querySelector('.super-great').textContent = sayHi(user)
