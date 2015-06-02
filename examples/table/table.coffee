View = crowdcontrol.view.View
Source = crowdcontrol.data.Source

api = new crowdcontrol.data.Api 'http://localhost:12345'
policy = new crowdcontrol.data.Policy
  intervalTime: 5000
streamingPolicy = new crowdcontrol.data.TabularRestfulStreamingPolicy
  intervalTime: 10000

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
      @loading = true
      @update()

    src.on Source.Events.LoadData, (data)=>
      @loading = false
      @model = data
      @update()

new TableView()

class ContentView extends View
  name: 'live-content'
  html: """
    <div class="text-center">{ model }</div>
  """
  js: ()->

new ContentView

class StreamingTable extends View
  name: 'streaming-table'
  html: """
    <div class="{ block: true, loading: loading }">
      <table>
        <thead>
          <tr>
            <th>Polygons in Random Order</th>
          </tr>
        </thead>
        <tbody>
          <tr each="{ model }" if="{ value != null }" class="animated flipInX">
            <td><live-content model="{ value }"></td>
          </tr>
          <tr></tr>
        </tbody>
      </table>
      <div class="loader">Loading...</div>
    </div>
  """
  js: ()->
    @loading = false

    src = new Source
      name: 'table2'
      api: api
      path: 'polygon'
      policy: streamingPolicy

    src.on Source.Events.Loading, ()=>
      @loading = true
      @model = []
      @update()

    src.on Source.Events.LoadDataPartial, (data)=>
      @update()
      @model = data
      console.log(@model)

    src.on Source.Events.LoadData, (data)=>
      @loading = false
      @model = data
      console.log(@model)
      @update()

new StreamingTable()
