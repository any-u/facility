export class Prepare {
  prepareMap = new Map()

  registry(project: string, script: any) {
    this.prepareMap.set(project, script)
  }

  runScript() {
    this.prepareMap.forEach((script) => {
      return script.run()
    })
  }
}
