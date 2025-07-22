@@ .. @@
             <Quote className="w-4 h-4" />
             <span>Citations</span>
           </button>
+          <button
+            onClick={() => onNavigate('tags')}
+            className={`w-full flex items-center space-x-2 px-3 py-2 text-left rounded-lg transition-colors ${
+              currentView === 'tags' 
+                ? 'bg-blue-100 text-blue-700 font-medium' 
+                : 'text-gray-700 hover:bg-gray-100'
+            }`}
+          >
+            <Hash className="w-4 h-4" />
+            <span>Tags</span>
+          </button>
+          <button
+            onClick={() => onNavigate('trash')}
+            className={`w-full flex items-center space-x-2 px-3 py-2 text-left rounded-lg transition-colors ${
+              currentView === 'trash' 
+                ? 'bg-blue-100 text-blue-700 font-medium' 
+                : 'text-gray-700 hover:bg-gray-100'
+            }`}
+          >
+            <Trash2 className="w-4 h-4" />
+            <span>Trash</span>
+          </button>
         </nav>
       </div>