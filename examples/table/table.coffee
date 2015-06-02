View = crowdcontrol.view.View
Source = crowdcontrol.data.Source

api = new crowdcontrol.data.Api 'http://localhost:12345'
policy = new crowdcontrol.data.Policy intervalTime: 3000

class TableView extends View
  name: 'live-table'
  html: """
    <div class="{ block: true, loading: loading }">
      <table>
        <thead>
          <tr>
            <th>Seconds Since Server Started</th>
          </tr>
        </thead>
        <tbody>
          <tr each="{ model }" class="animated bounceIn">
            <td><live-content model="{ value }"></td>
          </tr>
        </tbody>
      </table>
      <div class="loader">Loading...</div>
    </div>
  """
  js: ()->
    @loading = false

    src = new Source
      name: 'table'
      api: api
      path: 'seconds'
      policy: policy

    src.on Source.Events.Loading, ()=>
      @update()

    src.on Source.Events.LoadData, (res)=>
      @loading = false
      # simulate latency
      setTimeout ()=>
        @loading = true
        @update()
      , 1000
      @model = res
      @update()

new TableView()

class ContentView extends View
  name: 'live-content'
  html: """
    <div class="text-center">{ model }</div>
  """
  js: ()->

new ContentView
